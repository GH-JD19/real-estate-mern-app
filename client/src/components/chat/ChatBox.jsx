import { useEffect, useState, useRef } from "react";
import {
  sendMessage,
  onReceiveMessage,
  offReceiveMessage,
  onOnlineUsers,
  offOnlineUsers,
  sendTyping,
  onTyping,
  offTyping,
} from "../../services/socket";

export default function ChatBox({ user, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // 🔥 Load old messages
  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/${currentUser._id}/${user._id}`
        );
        const data = await res.json();
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.log("Load error", err);
      }
    };

    loadMessages();
  }, [user]);

  // 🔥 Real-time messages
  useEffect(() => {
    onReceiveMessage((msg) => {
      if (
        msg.senderId === user?._id ||
        msg.receiverId === user?._id
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    return () => offReceiveMessage();
  }, [user]);

  // 🟢 Online users
  useEffect(() => {
    onOnlineUsers(setOnlineUsers);
    return () => offOnlineUsers();
  }, []);

  // ✍️ Typing indicator
  useEffect(() => {
    onTyping((data) => {
      if (data.senderId === user?._id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1500);
      }
    });

    return () => offTyping();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!input.trim() || !user) return;

    const msg = {
      senderId: currentUser._id,
      receiverId: user._id,
      message: input,
      senderRole: currentUser.role,
    };

    sendMessage(msg);

    setMessages((prev) => [...prev, msg]);
    setInput("");
    scrollToBottom();
  };

  // ❌ No user selected
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          Chat
          <span onClick={onClose} style={styles.close}>✖</span>
        </div>

        <div style={{ padding: 20 }}>
          <p>Select a user to start chat</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {user.name}
        {onlineUsers.includes(user._id) && " 🟢"}
        <span onClick={onClose} style={styles.close}>✖</span>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign:
                msg.senderId === currentUser._id ? "right" : "left",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                background:
                  msg.senderId === currentUser._id
                    ? "#1877f2"
                    : "#eee",
                color:
                  msg.senderId === currentUser._id
                    ? "#fff"
                    : "#000",
                padding: "6px 10px",
                borderRadius: 10,
                display: "inline-block",
              }}
            >
              {msg.message}
            </span>
          </div>
        ))}

        {/* Typing */}
        {typing && (
          <p style={{ fontSize: 12, color: "#666" }}>
            Typing...
          </p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.input}>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            sendTyping({ receiverId: user._id });
          }}
          placeholder="Type message..."
          style={{ flex: 1, padding: 10, border: "none" }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: 320,
    height: 420,
    position: "fixed",
    bottom: 90,
    right: 20,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
  },
  header: {
    background: "#1877f2",
    color: "#fff",
    padding: 10,
    fontWeight: "bold",
  },
  close: {
    float: "right",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    padding: 10,
    overflowY: "auto",
  },
  input: {
    display: "flex",
    borderTop: "1px solid #ddd",
  },
};