const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      auto: true,
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    trip: {
      type: mongoose.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    seats: [
      {
        type: String,
        required: true,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },
    promoCode:{
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    bookingStatus: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "khalti", "esewa"],
      default: "cash",
    },

    // 🔥 NEW FIELDS
    pidx: {
      type: String,
      default: null,
    },

    transactionId: {
      type: String,
      default: null,
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);