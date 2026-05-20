import { io } from "socket.io-client";

// 🔹 BASE URL (PRODUCTION SAFE)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 TOKEN HELPER
const getToken = () =>
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

// 🔹 SOCKET INSTANCE (SINGLETON)
const socket = io(BASE_URL, {
  withCredentials: true,
  autoConnect: false,

  // 🔥 IMPORTANT FOR DEPLOY
  transports: ["websocket"],
  secure: true,

  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,

  auth: {
    token: getToken(),
    userId: null,
    role: null,
  },
});

// 🔹 CONNECT SOCKET
export const connectSocket = (user) => {
  if (!user?._id || !user?.role) {
    console.log("❌ Missing user data for socket");
    return;
  }

  socket.auth = {
    token: getToken(),
    userId: user._id,
    role: user.role,
  };

  if (!socket.connected) {
    socket.connect();
  }
};

// 🔹 DISCONNECT SOCKET
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// 🔹 SEND MESSAGE
export const sendMessage = (data) => {
  socket.emit("send_message", data);
};

// 🔹 RECEIVE MESSAGE
export const onReceiveMessage = (callback) => {
  socket.off("receive_message"); // prevent duplicate listeners
  socket.on("receive_message", callback);
};

export const offReceiveMessage = () => {
  socket.off("receive_message");
};

// 🔥 ONLINE USERS
export const onOnlineUsers = (callback) => {
  socket.off("online_users");
  socket.on("online_users", callback);
};

export const offOnlineUsers = () => {
  socket.off("online_users");
};

// 🔥 TYPING INDICATOR
export const sendTyping = (data) => {
  socket.emit("typing", data);
};

export const onTyping = (callback) => {
  socket.off("typing");
  socket.on("typing", callback);
};

export const offTyping = () => {
  socket.off("typing");
};

// 🔹 DEBUG (DEV ONLY)
if (import.meta.env.DEV) {
  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("⚠️ Socket error:", err.message);
  });
}

export default socket;