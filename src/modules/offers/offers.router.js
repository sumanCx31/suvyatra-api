const { USER_ROLES } = require("../../config/constants");
const auth = require("../../middlewares/auth.middleware");
const bodyValidator = require("../../middlewares/request-validate.middleware");
const { offerCltr } = require("./offers.controller");
const { validatePromoDTO } = require("./offers.validator");

const OfferRouter  = require("express").Router();

OfferRouter.post("/",auth(USER_ROLES.ADMIN || USER_ROLES.DRIVER),bodyValidator(validatePromoDTO),offerCltr.createPromo);
OfferRouter.get("/",offerCltr.getAllPromoByCode);

module.exports = OfferRouter;