const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  token: { type: String, required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  seats: [String],
  userId: mongoose.Schema.Types.ObjectId,
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "confirmed", "expired"],
    default: "pending"
  },
  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Reservation", ReservationSchema);