const bookcltr = require('./booking.controller');

const bookingRouter = require('express').Router();

bookingRouter.post("/",bookcltr.holdSeats)


module.exports = bookingRouter;