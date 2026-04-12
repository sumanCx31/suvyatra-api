const express = require("express");
const bookingRouter = express.Router();
const bookingCtrl = require("./booking.controller");

bookingRouter.post("/reserve", bookingCtrl.reserveSeats);
bookingRouter.get("/payment/:token", bookingCtrl.getPaymentDetails);
bookingRouter.post("/confirm", bookingCtrl.confirmBooking);


module.exports = bookingRouter;