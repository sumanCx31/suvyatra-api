const Trip = require("./../tripUpdation/tripUpdate.model");
const Reservation = require("./reservation.model");
const crypto = require("crypto");

// Helper: generate token
const generateToken = () => {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
};

class BookingController {

  // 1️⃣ Reserve Seats (5 min hold)
  reserveSeats = async (req, res) => {
    const { tripId, seatNumbers, userId } = req.body;

    try {
      const now = new Date();

      // 🔥 Clear expired reservations
      await Trip.updateOne(
        { _id: tripId },
        {
          $set: {
            "seats.$[elem].reservedBy": null,
            "seats.$[elem].reservedAt": null
          }
        },
        {
          arrayFilters: [
            {
              "elem.reservedAt": { $lt: new Date(now - 5 * 60 * 1000) },
              "elem.isBooked": false
            }
          ]
        }
      );

      // 🔥 Check availability
      const trip = await Trip.findById(tripId);

      const unavailable = trip.seats.filter(s =>
        seatNumbers.includes(s.seatNumber) &&
        (s.isBooked || s.reservedBy)
      );

      if (unavailable.length > 0) {
        return res.status(409).json({ message: "Some seats already taken" });
      }

      // 🔥 Reserve seats
      await Trip.updateOne(
        { _id: tripId },
        {
          $set: {
            "seats.$[elem].reservedBy": userId,
            "seats.$[elem].reservedAt": now
          }
        },
        {
          arrayFilters: [{ "elem.seatNumber": { $in: seatNumbers } }]
        }
      );

      // 🔥 Create reservation token
      const token = generateToken();
      const totalAmount = trip.price * seatNumbers.length;

      await Reservation.create({
        token,
        tripId,
        seats: seatNumbers,
        userId,
        totalAmount,
        expiresAt: new Date(now.getTime() + 5 * 60 * 1000)
      });

      res.json({
        token,
        totalAmount,
        message: "Seats reserved for 5 minutes"
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // 2️⃣ Get Payment Details using Token
  getPaymentDetails = async (req, res) => {
    const { token } = req.params;

    try {
      const reservation = await Reservation.findOne({ token });

      if (!reservation) {
        return res.status(404).json({ message: "Invalid token" });
      }

      if (reservation.expiresAt < new Date()) {
        return res.status(400).json({ message: "Token expired" });
      }

      res.json(reservation);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // 3️⃣ Confirm Booking (after payment)
  confirmBooking = async (req, res) => {
    const { token, paymentRefId } = req.body;

    try {
      const reservation = await Reservation.findOne({ token });

      if (!reservation) {
        return res.status(404).json({ message: "Invalid token" });
      }

      if (reservation.expiresAt < new Date()) {
        return res.status(400).json({ message: "Reservation expired" });
      }

      // 🔥 (Optional) Verify payment here

      // 🔥 Mark seats as booked
      await Trip.updateOne(
        { _id: reservation.tripId },
        {
          $set: {
            "seats.$[elem].isBooked": true,
            "seats.$[elem].reservedBy": null,
            "seats.$[elem].reservedAt": null
          }
        },
        {
          arrayFilters: [
            { "elem.seatNumber": { $in: reservation.seats } }
          ]
        }
      );

      // 🔥 Update reservation
      reservation.status = "confirmed";
      await reservation.save();

      res.json({
        message: "Booking confirmed",
        paymentRefId
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = new BookingController();