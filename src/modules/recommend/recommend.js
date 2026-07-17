const express = require("express");
const { recommendPlaces } = require("./recommend.controller");

const recommendRouter = express.Router();

recommendRouter.post("/recommend-places", recommendPlaces);

module.exports = recommendRouter;