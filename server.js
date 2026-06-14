require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const statsRoutes = require("./routes/statsRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { Server } = require("socket.io");

const { Message, Conversation } = require("./models/chatModel");
const Notification = require("./models/Notification");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app); // Wrap express in http.Server for Socket.io

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // In production, set this to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// REST Routes
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
// Home Route
app.get("/", (req, res) => {
  res.send("BabbaFly Backend Running");
});

// ─── Socket.io Real-Time Chat ────────────────────────────────────────────────
// Map userId → socketId for targeted notifications
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // User registers their userId when they log in
  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Join a specific conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave a conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
  });

  // Send a message in real-time
  socket.on("send_message", async (data) => {
    // data = { conversationId, senderId, text }
    try {
      const { conversationId, senderId, text } = data;

      // Save to DB
      const message = await Message.create({
        conversationId,
        senderId,
        text,
      });

      // Update conversation's last message
      const convo = await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: text, lastMessageAt: new Date() },
        { new: true }
      );

      // Populate sender name
      const populated = await Message.findById(message._id).populate("senderId", "name");

      // Broadcast to everyone in the room
      io.to(conversationId).emit("receive_message", populated);

      // Send notification to the OTHER participant if they're online
      if (convo) {
        const otherId = convo.participants.find((p) => p.toString() !== senderId);
        if (otherId) {
          // Save notification to DB
          await Notification.create({
            userId: otherId,
            type: "message",
            title: "New Message",
            message: `You have a new message`,
            link: `/chat/${conversationId}`,
          });

          // Push to other user's socket if they're online
          const otherSocket = onlineUsers.get(otherId.toString());
          if (otherSocket) {
            io.to(otherSocket).emit("notification", {
              type: "message",
              message: `New message received`,
            });
          }
        }
      }
    } catch (err) {
      console.error("Socket message error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", ({ conversationId, userName }) => {
    socket.to(conversationId).emit("user_typing", { userName });
  });

  socket.on("stop_typing", ({ conversationId }) => {
    socket.to(conversationId).emit("user_stopped_typing");
  });

  // Disconnect
  socket.on("disconnect", () => {
    // Remove from online map
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// Start Server (use `server`, not `app`)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});