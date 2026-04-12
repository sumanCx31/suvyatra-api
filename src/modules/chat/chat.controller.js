const ChatModel = require("./chat.model");

class ChatController {
  // Get chat history
  getChatHistory = async (req, res) => {
    try {
      if (!req.authUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const senderId = req.authUser._id;
      const { receiverId } = req.params;

      const messages = await ChatModel.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId }
        ]
      }).sort({ createdAt: 1 });

      res.json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ message: "Error", error: error.message });
    }
  }

  // Send message
  sendMessage = async (req, res) => {
    try {
      if (!req.authUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const senderId = req.authUser._id;
      const { receiver, message } = req.body;

      const newMessage = new ChatModel({
        sender: senderId,
        receiver: receiver,
        message: message
      });

      await newMessage.save();

      const populated = await ChatModel.findById(newMessage._id).populate("sender", "name");

      res.json({ success: true, data: populated });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ChatController();