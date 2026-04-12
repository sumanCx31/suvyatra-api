const mongoose = require("mongoose");
const { USER_ROLES, Status, GENDER } = require("../../config/constants");

const BannerSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      auto: true,
    },

    title: {
      type: String,
      min: 2,
      max: 50,
      required: true,
    },
    description: {
      type: String,
      required: true,
      max: 500,
    },
    image: {
      publicId: String,
      secureUrl: String,
      optimizedUrl: String,
    },
    link: {
      type: String,
      required: false,
    },
    isActive: {
      type: String,
      default: true,
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

const BannerModel = mongoose.model("Banner", BannerSchema);
module.exports = BannerModel;
