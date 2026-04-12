const DriverBusTrip = require("./driver.bus.trip");

const driverRoute = require('express').Router();

driverRoute.get("/",DriverBusTrip);

module.exports = driverRoute;