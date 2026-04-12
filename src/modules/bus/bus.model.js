const mongoose = require("mongoose");
const { Status, BUS_TYPES } = require("../../config/constants");

const BusSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      auto: true,
    },

    name: {
      type: String,
      min: 2,
      max: 50,
    },

    busNumber: {
      type: String,
      required: true,
    },

    busType: {
      type: String,
      enum: Object.values(BUS_TYPES),
      default: BUS_TYPES.DELUXE,
    },

    driverName: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
    },

    seats: [
      {
        seatNumber: String,
        isBooked: {
          type: Boolean,
          default: false,
        },
      },
    ],

    image: {
      publicId: String,
      secureUrl: String,
      optimizedUrl: String,
    },

    isActive: {
      type: String,
      enum: Object.values(Status),
      default: Status.INACTIVE,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  {
    autoCreate: true,
    autoIndex: true,
    timestamps: true,
  },
);

const BusModel = mongoose.model("Bus", BusSchema);
module.exports = BusModel;
