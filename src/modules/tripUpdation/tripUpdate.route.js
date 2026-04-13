const TripUpdateRouter = require("express").Router();
const { USER_ROLES } = require("../../config/constants");
const auth = require("../../middlewares/auth.middleware");
const bodyValidator = require("../../middlewares/request-validate.middleware");
const TripCltr = require("./tripUpdate.controller");
const { TripValidateDTO, TripUpdateValidateDTO } = require("./tripUpdate.validator");

TripUpdateRouter.get("/bus/:id", TripCltr.getTripByBusId);

TripUpdateRouter.post("/", bodyValidator(TripValidateDTO), TripCltr.create);
TripUpdateRouter.get("/", TripCltr.getAllTrips);

TripUpdateRouter.get("/:id", TripCltr.getTripById);
TripUpdateRouter.patch("/seat-reserve/:id", TripCltr.seatReservation);
TripUpdateRouter.delete("/:id", TripCltr.deleteById);
TripUpdateRouter.put(
  "/:id",
  // auth(USER_ROLES.DRIVER || USER_ROLES.ADMIN),
  bodyValidator(TripUpdateValidateDTO),
  TripCltr.updateById,
);

module.exports = TripUpdateRouter;