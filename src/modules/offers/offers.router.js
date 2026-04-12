const bodyValidator = require("../../middlewares/request-validate.middleware");
const { offerCltr } = require("./offers.controller");
const { validatePromoDTO } = require("./offers.validator");

const OfferRouter  = require("express").Router();

OfferRouter.post("/",bodyValidator(validatePromoDTO),offerCltr.createPromo);
OfferRouter.get("/",offerCltr.getAllPromoByCode);

module.exports = OfferRouter;