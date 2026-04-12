const axios = require("axios");
const mongoose = require("mongoose");

const OrderModel = require("./order.model");
const TripModel = require("../tripUpdation/tripUpdate.model");
const orderSvc = require("./order.service");
const BusModel = require("../bus/bus.model");
const { PaymentConfig, AppConfig } = require("../../config/config");
const { offerSvc } = require("../offers/offers.service");
const { string } = require("joi");
const orderModel = require("./order.model");

class OrderController {
  // Create Order (already working, kept clean)
  createOrder = async (req, res) => {
    try {
      const data = req.body;
      let { promoCode, user } = data;
      let discountPercentage = 0;

      // Step 1: If promo exists → validate
      if (promoCode) {
        const checkPromo = await offerSvc.getPromoByCode(promoCode);

        if (!checkPromo) {
          throw {
            code: 400,
            message: "Invalid promo code",
          };
        }

        // Step 2: Check already used
        const existingOrder = await orderModel.findOne({
          user: user, // now matches the DB ObjectId
          promoCode: promoCode, // optional: only if you want promo-specific check
          paymentStatus: "paid",
        });
        console.log("hello:", existingOrder);

        if (existingOrder) {
          throw {
            code: 400,
            message: "Promo already used",
          };
        }

        discountPercentage = checkPromo.discountPercentage;
      }

      // Step 3: Create order
      const order = await orderSvc.create(data, discountPercentage);

      res.status(201).json({
        message: "Order created successfully",
        data: order,
      });
    } catch (err) {
      console.error(err);
      res.status(err.code || 500).json({
        message: err.message || "Server error",
      });
    }
  };

 getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      OrderModel.find()
        .populate("trip", "from to date")
        .populate("user", "name email")
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit),
      OrderModel.countDocuments(),
    ]);

    // 3. Calculate total pages
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      status: "SUCCESS",
      data: orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        limit,
      },
      message: "Orders retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "ERROR",
      message: err.message,
    });
  }
};

  totalTicketsSold = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today (midnight)

    const stats = await OrderModel.aggregate([
      {
        $match: { bookingStatus: "booked" }
      },
      {
        $facet: {
          // All-time stats
          allTime: [
            {
              $group: {
                _id: null,
                totalTicketsSold: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
              }
            }
          ],
          // Stats for today only
          today: [
            {
              $match: { createdAt: { $gte: today } } // Filter by today's date
            },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$totalAmount" }
              }
            }
          ]
        }
      }
    ]);

    const allTimeData = stats[0].allTime[0] || { totalTicketsSold: 0, totalRevenue: 0 };
    const todayData = stats[0].today[0] || { revenue: 0 };

    res.status(200).json({
      status: "SUCCESS",
      data: {
        totalTicketsSold: allTimeData.totalTicketsSold,
        totalRevenue: allTimeData.totalRevenue,
        todayRevenue: todayData.revenue // New field
      }
    });
  } catch (error) {
    res.status(500).json({ status: "ERROR", message: error.message });
  }
};

  // Get Single Order
  getSingleOrder = async (req, res) => {
    try {
      const _id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      const order = await OrderModel.findById(_id)
        .populate("trip", "from to date")
        .populate("user", "name email");
      const TripDetails = await TripModel.findById(order.trip._id).populate(
        "bus",
        "busNumber name busType",
      );
      const busDetails = {
        busName: TripDetails.bus.name,
        busNumber: TripDetails.bus.busNumber,
        busType: TripDetails.bus.busType,
      };
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      res.status(200).json({
        data: {
          order: {
            ...order._doc,
            busName: busDetails.busName,
            busNumber: busDetails.busNumber,
            busType: busDetails.busType,
          },
        },
        message: "Order retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  initiatePayment = async (req, res) => {
    try {
      const orderId = req.params.orderId;

      // 1. Find the order
      const order = await OrderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // 2. Call Khalti initiate API
      const response = await fetch(
        PaymentConfig.khalti.url + "epayment/initiate/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${PaymentConfig.khalti.secretKey}`,
          },
          body: JSON.stringify({
            return_url: `${AppConfig.frontendUrl}/payment-success`, // frontend success page
            website_url: AppConfig.frontendUrl,
            amount: order.totalAmount * 100, // Khalti expects paisa
            purchase_order_id: order._id.toString(),
            purchase_order_name: "Bus Ticket Booking",
          }),
        },
      );

      const data = await response.json();

      // 3. Save pidx in order document
      if (data.pidx) {
        order.pidx = data.pidx;
        order.paymentMethod = "khalti";
        await order.save(); // ✅ saves pidx in DB
      } else {
        return res.status(500).json({ message: "Payment initiation failed" });
      }

      // 4. Return the payment URL to frontend
      res.json({
        status: "PAYMENT_INITIATE",
        message: "Payment initiated",
        data: {
          pidx: data.pidx,
          payment_url: `https://test-pay.khalti.com/?pidx=${data.pidx}`,
        },
      });
    } catch (error) {
      console.error("Payment Initiation Error:", error);
      res.status(500).json({ message: "Payment initiation failed" });
    }
  };

  getAllOrdersByDriverId = async (req, res) => {
    try {
      const { driverId } = req.params;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // =========================
      // 2. Get Driver Buses
      // =========================
      const driverBuses = await BusModel.find({ driverId }).select("_id");

      if (!driverBuses.length) {
        return res.status(200).json({
          status: true,
          message: "No buses assigned to this driver",
          data: [],
          pagination: { total: 0, page, pages: 0 },
          totalRevenue: 0,
          todayRevenue: 0,
          orderCount: 0,
        });
      }

      const busIds = driverBuses.map((b) => b._id);

      const assignedTrips = await TripModel.find({
        bus: { $in: busIds },
      }).select("_id");

      if (!assignedTrips.length) {
        return res.status(200).json({
          status: true,
          message: "No trips scheduled for these buses",
          data: [],
          pagination: { total: 0, page, pages: 0 },
          totalRevenue: 0,
          todayRevenue: 0,
          orderCount: 0,
        });
      }

      const tripIds = assignedTrips.map((t) => t._id);

      const allPaidOrders = await OrderModel.find({
        trip: { $in: tripIds },
        paymentStatus: "paid",
      })
        .select("totalAmount createdAt trip")
        .populate({ path: "trip", select: "date" });

      const totalOrdersCount = await OrderModel.countDocuments({
        trip: { $in: tripIds },
      });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const totalRevenue = allPaidOrders.reduce(
        (sum, order) => sum + (Number(order.totalAmount) || 0),
        0,
      );

      const todayRevenue = allPaidOrders
        .filter((order) => {
          const createdAt = new Date(order.createdAt);
          return createdAt >= startOfToday && createdAt <= endOfToday;
        })
        .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

      const paginatedOrders = await OrderModel.find({
        trip: { $in: tripIds },
      })
        .populate({
          path: "trip",
          select: "-seats",
          populate: {
            path: "bus",
            select: "busNumber name busType",
          },
        })
        .populate("user", "name phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.status(200).json({
        status: true,
        message:
          paginatedOrders.length > 0
            ? "Data retrieved successfully"
            : "No orders found",

        totalRevenue,
        todayRevenue,

        pagination: {
          totalItems: totalOrdersCount,
          currentPage: page,
          totalPages: Math.ceil(totalOrdersCount / limit),
          limit,
        },

        data: paginatedOrders.map((order) => ({
          _id: order._id,
          trip: order.trip,
          user: order.user,
          seats: order.seats,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
        })),
      });
    } catch (exception) {
      console.error("Error in getAllOrdersByDriverId:", exception);
      return res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error: exception.message,
      });
    }
  };

  //VERIFY PAYMENT (FINAL SAFE VERSION)
  verifyPayment = async (req, res) => {
    try {
      const { pidx } = req.body;

      // if (!pidx) {
      //   return res.status(400).json({ message: "pidx is required" });
      // }

      // 1️⃣ Find the order by pidx
      const order = await OrderModel.findOne({ pidx });

      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found for this payment" });
      }

      // 2️⃣ Prevent duplicate verification
      if (order.paymentStatus === "paid") {
        return res.status(200).json({
          message: "Payment already verified",
          status: "ALREADY_VERIFIED",
        });
      }

      // 3️⃣ Call Khalti lookup API
      const { data: khaltiData } = await axios.post(
        `${PaymentConfig.khalti.url}epayment/lookup/`,
        { pidx },
        {
          headers: {
            Authorization: `Key ${PaymentConfig.khalti.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Khalti Response:", khaltiData);

      // 4️⃣ Validate Khalti response
      if (!khaltiData || khaltiData.status !== "Completed") {
        order.paymentStatus = "failed";
        await order.save();
        return res.status(400).json({
          message: `Payment not completed: ${khaltiData.status || "Unknown"}`,
          data: khaltiData,
        });
      }

      if (khaltiData.total_amount !== order.totalAmount * 100) {
        order.paymentStatus = "failed";
        await order.save();
        return res
          .status(400)
          .json({ message: "Payment amount mismatch", data: khaltiData });
      }

      // 5️⃣ Update order as paid
      order.paymentStatus = "paid";
      order.transactionId = khaltiData.transaction_id;
      await order.save();

      // 6️⃣ Update trip seats
      await TripModel.updateOne(
        { _id: order.trip },
        {
          $set: {
            "seats.$[elem].isBooked": true,
            "seats.$[elem].reservedBy": order.user,
            "seats.$[elem].reservedAt": new Date(),
          },
        },
        {
          arrayFilters: [{ "elem.seatNumber": { $in: order.seats } }],
        },
      );

      return res
        .status(200)
        .json({ message: "Payment verified successfully", status: "SUCCESS" });
    } catch (error) {
      console.error(
        "Verification Error:",
        error.response?.data || error.message,
      );
      res.status(500).json({
        message: "Verification failed",
        error: error.response?.data || error.message,
      });
    }
  };

  //  Get My Tickets
  getMyTickets = async (req, res) => {
    try {
      const pidx = req.params._id;

      const orderDetail = await OrderModel.find({ pidx })
        .select("trip user seats") // only required fields from Order
        .populate({
          path: "trip",
          select: "from to date seats", // only trip name
        })
        .populate({
          path: "user",
          select: "name", // only user name
        });

      // Optional: format response (clean structure)
      const formatted = orderDetail.map((order) => ({
        from: order.trip?.from,
        to: order.trip?.to,
        userName: order.user?.name,
        seats: order?.seats,
        date: order.trip?.date,
      }));

      res.json({
        data: formatted,
        message: "Tickets retrieved successfully",
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };

  getMyTicketsByUserId = async (req, res) => {
    try {
      const userId = req.params.userId;

      const orders = await OrderModel.find({
        user: userId,
        paymentStatus: "paid",
      })
        .select("trip seats totalAmount bookingStatus user paymentMethod")
        .populate({
          path: "trip",
          select: "from to date",
        })
        .populate({
          path: "user",
          select: "name email",
        });
      res.json({
        data: orders,
        message: "Tickets retrieved successfully",
      });
    } catch (exception) {
      throw exception;
    }
  };

  getTodayRevenue = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const orders = await OrderModel.find({
        paymentStatus: "paid",
        createdAt: { $gte: today, $lt: tomorrow },
      });
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (Number(order.totalAmount) || 0),
        0,
      );
      res.json({
        data: totalRevenue,
        message: "Today's revenue retrieved successfully",
      });
    } catch (exception) {
      throw exception;
    }}
}

module.exports = new OrderController();
