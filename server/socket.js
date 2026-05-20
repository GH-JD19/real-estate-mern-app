const { Server } = require("socket.io");
const Message = require("./models/Message");

let io;

// 🔥 Track online users
const onlineUsers = new Map();

// ✅ Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
].filter(Boolean);

// ✅ Init Socket
const initSocket = (server) => {
  if (io) {
    console.log("Socket already initialized");
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.warn("❌ Blocked by Socket CORS:", origin);
        return callback(null, false);
      },
      credentials: true,
    },

    // 🔥 IMPORTANT FOR DEPLOY
    transports: ["websocket"],

    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // ✅ Auth Middleware
  io.use((socket, next) => {
    try {
      const { userId, role } = socket.handshake.auth || {};

      if (!userId || typeof userId !== "string") {
        return next(new Error("Invalid userId"));
      }

      if (!["admin", "agent", "user"].includes(role)) {
        return next(new Error("Invalid role"));
      }

      socket.user = { userId, role };
      next();
    } catch (err) {
      console.error("❌ Auth error:", err.message);
      next(new Error("Socket authentication failed"));
    }
  });

  // ✅ Connection
  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);

    const { userId, role } = socket.user;

    // 🔹 Join personal room
    socket.join(`${role}:${userId}`);

    // 🟢 Add to online users
    onlineUsers.set(userId, socket.id);

    // 🔥 Broadcast online users
    io.emit("online_users", Array.from(onlineUsers.keys()));

    // 💬 SEND MESSAGE
    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, message, senderRole } = data;

        if (!senderId || !receiverId || !message) return;

        const savedMessage = await Message.create({
          senderId,
          receiverId,
          message,
          senderRole,
        });

        // 🔥 Send to both users
        const targets = [
          `user:${receiverId}`,
          `agent:${receiverId}`,
          `user:${senderId}`,
          `agent:${senderId}`,
        ];

        targets.forEach((room) => {
          io.to(room).emit("receive_message", savedMessage);
        });

      } catch (err) {
        console.error("❌ Chat error:", err);
      }
    });

    // ✍️ Typing Indicator
    socket.on("typing", ({ receiverId }) => {
      const senderId = socket.user.userId;

      io.to(`user:${receiverId}`).emit("typing", { senderId });
      io.to(`agent:${receiverId}`).emit("typing", { senderId });
    });

    // 🔹 Error handling
    socket.on("error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    // 🔹 Disconnect
    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", socket.id, "| Reason:", reason);

      // 🔥 Remove from online users
      onlineUsers.delete(userId);

      // 🔥 Broadcast updated list
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

// ✅ Getter
const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initSocket, getIO };