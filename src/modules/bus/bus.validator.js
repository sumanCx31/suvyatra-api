const joi = require("joi");

const BusValidatorDTO = joi.object({
    name:joi.string().min(2).required(),
    busNumber:joi.string().required(),
    busType:joi.string().regex(/^(ac|deluxe|sleeper)$/).default('deluxe'),
    driverName:joi.string().required(),
    driverId:joi.string().required(),
    phone:joi.string().required(),
    totalSeats:joi.number().required(),
    isActive:joi.string().regex(/^(active|inactive)$/).default('inactive'),
})

module.exports = {
    BusValidatorDTO
}