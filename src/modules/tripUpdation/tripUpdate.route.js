const TripUpdateRouter = require("express").Router();
const bodyValidator = require("../../middlewares/request-validate.middleware");
const TripCltr = require("./tripUpdate.controller");
const { TripValidateDTO } = require("./tripUpdate.validator");

TripUpdateRouter.get("/bus/:id", TripCltr.getTripByBusId);

TripUpdateRouter.post("/", bodyValidator(TripValidateDTO), TripCltr.create);
TripUpdateRouter.get("/", TripCltr.getAllTrips);

TripUpdateRouter.get("/:id", TripCltr.getTripById);
TripUpdateRouter.patch("/seat-reserve/:id", TripCltr.seatReservation);
TripUpdateRouter.delete("/:id", TripCltr.deleteById);
TripUpdateRouter.put(
  "/:id",
  bodyValidator(TripValidateDTO),
  TripCltr.updateById,
);

module.exports = TripUpdateRouter;