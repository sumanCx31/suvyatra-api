const { AppConfig } = require("../../config/config");
const authSvc = require("../auth/auth.service");
const BusModel = require("../bus/bus.model");
const userSvc = require("../user/user.service");
const jwt = require("jsonwebtoken");

const DriverBusTrip = async (req, res, next) => {
  let token = req.headers["authorization"] || null;

  try {
    let authData = await authSvc.getSingleRowByFilter({
      maskedAccessToken: token,
    });
    const data = jwt.verify(authData.accessToken, AppConfig.jwtSecret);
    let userDetail = await userSvc.getSingleUserByFilter({
      _id: data.sub,
    });
    let DriverBus = await BusModel.find({ _id: userDetail._id });
    res.json({
        data:DriverBus,
        status:"success"
    })
  } catch (exception) {
    throw exception;
  }
};
module.exports = DriverBusTrip;
