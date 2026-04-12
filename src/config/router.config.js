const driverRoute = require("../modules/admin/driver.route");
const authRouter = require("../modules/auth/auth.router");
const bannerRouter = require("../modules/banner/banner.router");
const busRouter = require("../modules/bus/bus.router");
const ChatRouter = require("../modules/chat/chat.router");
const OfferRouter = require("../modules/offers/offers.router");
const OrderRouter = require("../modules/order/order.router");
const bookingRouter = require("../modules/reservation/booking.route");
const searchRouter = require("../modules/searchByRoute/search.route");
const TripUpdateRouter = require("../modules/tripUpdation/tripUpdate.route");

const router = require("express").Router()
router.get("/",(req, res, next) => {
    res.json({
        data: null,
         message: "Health ok",
        status: "Sucess",
        options: null
    })
})

router.use("/auth",authRouter);
router.use("/banners",bannerRouter);
router.use("/bus",busRouter);
router.use("/search",searchRouter)
router.use("/trip-update",TripUpdateRouter);
router.use("/book-ticket",bookingRouter);
router.use("/driver-bus",driverRoute);
router.use("/order",OrderRouter);
router.use("/chat",ChatRouter);
router.use("/offers",OfferRouter);

module.exports = router;