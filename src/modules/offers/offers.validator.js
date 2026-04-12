const Joi = require("joi");

const validatePromoDTO = Joi.object({
  code: Joi.string().required(),
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  discountPercentage: Joi.number().min(0).max(100).required(),
  minAmount: Joi.number().min(0).optional(),
  maxDiscount: Joi.number().min(0).optional(),
  expiryDate: Joi.date().greater("now").required(),
  isActive: Joi.boolean().optional(),
})

module.exports = {
    validatePromoDTO
}