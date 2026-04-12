const joi = require("joi");

const TripValidateDTO = joi.object({
    bus: joi.string().required(),
    from: joi.string().required(),
    to: joi.string().required(),
    departureTime: joi.string(),
    arrivalTime: joi.string(),
    date: joi.date().required(),
    price: joi.number().required(),
    seats:joi.array(),
    status: joi.string().valid("scheduled","cancelled","completed").default("scheduled")
});

module.exports = { TripValidateDTO };