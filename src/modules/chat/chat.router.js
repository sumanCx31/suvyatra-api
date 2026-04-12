const ChatRouter = require("express").Router();
const chatCtrl = require("./chat.controller");
const auth = require("../../middlewares/auth.middleware");

// Attach auth middleware correctly (without calling it)
ChatRouter.get("/:receiverId", auth, chatCtrl.getChatHistory);
ChatRouter.post("/message", auth, chatCtrl.sendMessage);

module.exports = ChatRouter;