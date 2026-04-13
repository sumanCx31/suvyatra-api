const { USER_ROLES } = require('../../config/constants');
const auth = require('../../middlewares/auth.middleware');
const bodyValidator = require('../../middlewares/request-validate.middleware');
const orderCltr = require('./order.controller');
const { createOrderValidator } = require('./order.validator');

const OrderRouter = require('express').Router();

OrderRouter.post("/",bodyValidator(createOrderValidator),orderCltr.createOrder);
OrderRouter.get("/tickets-sold", orderCltr.totalTicketsSold);
// OrderRouter.get("/today-revenue", orderCltr.getTodayRevenue);

OrderRouter.get("/",auth(USER_ROLES.ADMIN), orderCltr.getAllOrders);
OrderRouter.get('/:id', orderCltr.getSingleOrder);
OrderRouter.get("/my-orders/:driverId",auth(USER_ROLES.DRIVER),orderCltr.getAllOrdersByDriverId);
OrderRouter.post("/payment/verify", orderCltr.verifyPayment);
OrderRouter.post("/payment/:orderId",orderCltr.initiatePayment);

OrderRouter.get("/my-tickets/:_id",orderCltr.getMyTickets);
OrderRouter.get("/ticket/:userId",orderCltr.getMyTicketsByUserId);
module.exports = OrderRouter;