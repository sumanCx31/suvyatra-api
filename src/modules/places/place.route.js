const placeRouter = require("express").Router();

const uploader = require("../../middlewares/uploader.middleware");
const placeController = require("./place.controller");

placeRouter.post("/",uploader().single("image"), placeController.createPlace);

placeRouter.get("/", placeController.getAllPlaces);

placeRouter.get("/travel-destinations", placeController.getTravelDestinations);

placeRouter.get("/:id", placeController.getPlaceById);

placeRouter.patch("/:id", placeController.updatePlace);

placeRouter.delete("/:id", placeController.deletePlace);

// placeRouter.post("/recommend", placeController.recommendPlaces);

module.exports = placeRouter;