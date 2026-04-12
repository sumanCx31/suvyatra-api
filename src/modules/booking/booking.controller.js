// controllers/booking.controller.js
const Trip = require("../tripUpdation/tripUpdate.model");

class BookingController {

  // 🔹 HOLD SEATS (5 min)
  holdSeats = async (req, res) => {
    const { routeId, seats, userId } = req.body;
    const seatNumbers = seats.map((s) => s.seatNumber);

    try {
      const now = new Date();
      const expiryTime = new Date(now.getTime() - 5 * 60 * 1000);

      const result = await Trip.updateOne(
        {
          _id: routeId,
          seats: {
            $not: {
              $elemMatch: {
                seatNumber: { $in: seatNumbers },
                status: { $ne: "available" },
                reservedBy: { $ne: userId },
                reservedAt: { $gt: expiryTime },
              },
            },
          },
        },
        {
          $set: {
            "seats.$[elem].status": "pending",
            "seats.$[elem].reservedBy": userId,
            "seats.$[elem].reservedAt": now,
          },
        },
        {
          arrayFilters: [
            { "elem.seatNumber": { $in: seatNumbers } },
          ],
        }
      );

      if (result.modifiedCount === 0) {
        return res.status(409).json({
          message: "Seats are already taken or temporarily locked!",
        });
      }

      return res.status(200).json({
        message: "Seats held for 5 minutes. Proceed to payment.",
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };

  // 🔹 CONFIRM BOOKING
  confirmBooking = async (req, res) => {
    const { routeId, userId } = req.body;

    try {
      await Trip.updateOne(
        { _id: routeId },
        {
          $set: {
            "seats.$[elem].status": "booked",
          },
        },
        {
          arrayFilters: [
            {
              "elem.reservedBy": userId,
              "elem.status": "pending",
            },
          ],
        }
      );

      return res.status(200).json({
        message: "Booking confirmed successfully!",
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };

  // 🔹 RELEASE SEATS (MANUAL CANCEL)
  releaseSeats = async (req, res) => {
    const { routeId, userId } = req.body;

    try {
      await Trip.updateOne(
        { _id: routeId },
        {
          $set: {
            "seats.$[elem].status": "available",
            "seats.$[elem].reservedBy": null,
            "seats.$[elem].reservedAt": null,
          },
        },
        {
          arrayFilters: [
            {
              "elem.reservedBy": userId,
              "elem.status": "pending",
            },
          ],
        }
      );

      return res.status(200).json({
        message: "Seats released successfully!",
      });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };

  // 🔹 AUTO RELEASE EXPIRED SEATS
  autoReleaseExpired = async () => {
    const expiryTime = new Date(Date.now() - 5 * 60 * 1000);

    await Trip.updateMany(
      {},
      {
        $set: {
          "seats.$[elem].status": "available",
          "seats.$[elem].reservedBy": null,
          "seats.$[elem].reservedAt": null,
        },
      },
      {
        arrayFilters: [
          {
            "elem.status": "pending",
            "elem.reservedAt": { $lt: expiryTime },
          },
        ],
      }
    );

    console.log("Expired seats released");
  };
}

const bookcltr = new BookingController();
module.exports  = bookcltr