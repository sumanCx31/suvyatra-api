const bodyValidator = require("../../middlewares/request-validate.middleware");
const SearchController = require("./search.controller");
const { SearchValidateDTO } = require("./search.validator");

const searchRouter = require("express").Router();

searchRouter.post("/",bodyValidator(SearchValidateDTO),SearchController);

module.exports = searchRouter;