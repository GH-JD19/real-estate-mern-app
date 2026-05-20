const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// ✅ Get chat between user & agent
router.get("/:userId/:agentId", async (req, res) => {
  try {
    const { userId, agentId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: agentId },
        { senderId: agentId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

module.exports = router;