const OrderModel = require("../order/order.model");
const TripModel = require("../tripUpdation/tripUpdate.model");

class OrderService {
  create = async (data, discountPercentage = 0) => {
  try {
    const { user, trip, seats, paymentMethod, promoCode } = data;

    if (!user || !trip || !seats || seats.length === 0) {
      throw { status: 400, message: "Missing required fields" };
    }

    const tripData = await TripModel.findById(trip);
    if (!tripData) {
      throw { status: 404, message: "Trip not found" };
    }

    const totalAmount =
      tripData.price * seats.length -
      (tripData.price * seats.length * discountPercentage) / 100;

    // 🔹 Seat check
    const existingOrders = await OrderModel.find({
      trip,
      bookingStatus: "booked",
    });

    let conflictingSeats = [];
    existingOrders.forEach((order) => {
      order.seats.forEach((seat) => {
        if (seats.includes(seat)) {
          conflictingSeats.push(seat);
        }
      });
    });

    if (conflictingSeats.length > 0) {
      throw {
        status: 400,
        message: `Seats already booked: ${conflictingSeats.join(", ")}`,
      };
    }

    // 🔹 Create order with "pending" payment status
    const order = await OrderModel.create({
      user,
      trip,
      seats,
      totalAmount,
      paymentMethod,
      promoCode: promoCode || null,
      paymentStatus: "pending",
    });

 
    const populatedOrder = await OrderModel.findById(order._id)
      .populate("user", "name email phone image")
      .populate("trip", "from to date departureTime arrivalTime");

    setTimeout(async () => {
      try {
        const expiredOrder = await OrderModel.findById(order._id);
        if (expiredOrder && expiredOrder.paymentStatus === "pending") {
         
          expiredOrder.bookingStatus = "cancelled";
          await expiredOrder.save();
          console.log(`Order ${order._id} expired: seats released`);
        }
      } catch (err) {
        console.error("Error expiring order:", err);
      }
    }, 10 * 60 * 1000); 

    return populatedOrder;
  } catch (exception) {
    throw exception;
  }
};

  getSingleRowByFilter = async(_id)=>{
    try {
      // const orderDetail = await OrderModel.findOne(filter).populate('User',["_id","name","email","address","Phone","image","role","status"]);
      const orderDetail = await OrderModel.find({_id:_id});
      return orderDetail;
    } catch (exception) {
      exception
    }
  }
}

const orderSvc = new OrderService();
module.exports = orderSvc;