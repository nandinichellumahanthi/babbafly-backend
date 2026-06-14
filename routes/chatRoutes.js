const express = require("express");
const router = express.Router();
const { Conversation, Message } = require("../models/chatModel");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/chat/conversations — get all conversations for logged-in user
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("listingId", "title images price")
      .populate("participants", "name")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

// POST /api/chat/conversations — start or get existing conversation
router.post("/conversations", authMiddleware, async (req, res) => {
  try {
    const { listingId, sellerId } = req.body;
    const buyerId = req.user.id;

    if (buyerId === sellerId) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    // Check if conversation already exists
    let convo = await Conversation.findOne({
      listingId,
      participants: { $all: [buyerId, sellerId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        listingId,
        participants: [buyerId, sellerId],
      });
    }

    const populated = await Conversation.findById(convo._id)
      .populate("listingId", "title images price")
      .populate("participants", "name");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to create conversation" });
  }
});

// GET /api/chat/conversations/:conversationId/messages — get messages
router.get("/conversations/:conversationId/messages", authMiddleware, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.conversationId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    // Make sure user is a participant
    if (!convo.participants.map(String).includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("senderId", "name")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversationId: req.params.conversationId, senderId: { $ne: req.user.id }, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// POST /api/chat/conversations/:conversationId/messages — send a message (REST fallback)
router.post("/conversations/:conversationId/messages", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const convo = await Conversation.findById(req.params.conversationId);

    if (!convo) return res.status(404).json({ message: "Conversation not found" });
    if (!convo.participants.map(String).includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await Message.create({
      conversationId: req.params.conversationId,
      senderId: req.user.id,
      text,
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      lastMessage: text,
      lastMessageAt: new Date(),
    });

    // Notify the other participant
    const otherId = convo.participants.find((p) => p.toString() !== req.user.id);
    if (otherId) {
      await Notification.create({
        userId: otherId,
        type: "message",
        title: "New Message",
        message: `You have a new message`,
        link: `/chat/${req.params.conversationId}`,
      });
    }

    const populated = await Message.findById(message._id).populate("senderId", "name");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;