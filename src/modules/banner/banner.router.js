const { USER_ROLES } = require('../../config/constants');
const auth = require('../../middlewares/auth.middleware');
const { loginCheck } = require('../../middlewares/auth.middleware');
const bodyValidator = require('../../middlewares/request-validate.middleware');
const uploader = require('../../middlewares/uploader.middleware');
const bannerCtrl = require('./banner.controller');

const { CreateBannerDTO } = require('./banner.validator');

const bannerRouter = require('express').Router();

bannerRouter.post("/",uploader().single("image"),bodyValidator(CreateBannerDTO), bannerCtrl.createBanner);
bannerRouter.get("/", bannerCtrl.getAllBanner);
bannerRouter.get('/:id', bannerCtrl.getBannerById);
bannerRouter.put('/:id',uploader().single('image'), bodyValidator(CreateBannerDTO), bannerCtrl.updateBanner)
bannerRouter.delete("/:id", bannerCtrl.deleteBannerById);

module.exports = bannerRouter;