const Joi = require("joi");
const mongoose = require("mongoose");

// 🔹 Helper: validate ObjectId
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
};

const createOrderValidator = Joi.object({
  user: Joi.string().custom(objectId).required(),

  trip: Joi.string().custom(objectId).required(),

  seats: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),

  promoCode: Joi.string().optional(),

  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed")
    .optional(),

  bookingStatus: Joi.string()
    .valid("booked", "cancelled")
    .optional(),

  paymentMethod: Joi.string()
    .valid("cash", "khalti", "esewa")
    .optional(),
});

module.exports = {
  createOrderValidator,
};