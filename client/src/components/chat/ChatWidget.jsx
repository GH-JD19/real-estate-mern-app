import { useState, useEffect } from "react";
import ChatButton from "./ChatButton";
import ChatBox from "./ChatBox";
import {
  connectSocket,
  onReceiveMessage,
  offReceiveMessage,
} from "../../services/socket";

export default function ChatWidget({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unread, setUnread] = useState(0);

  // 🔥 Listen global chat trigger (open specific user chat)
  useEffect(() => {
    if (!currentUser) return;

    const handler = (e) => {
      if (!e.detail?._id) return;

      setSelectedUser(e.detail);
      connectSocket(currentUser);
      setOpen(true);
      setUnread(0); // reset unread
    };

    window.addEventListener("openChat", handler);

    return () => window.removeEventListener("openChat", handler);
  }, [currentUser]);

  // 🔴 Unread message counter
  useEffect(() => {
    if (!currentUser) return;

    const handler = () => {
      if (!open) {
        setUnread((prev) => prev + 1);
      }
    };

    onReceiveMessage(handler);

    return () => offReceiveMessage();
  }, [open, currentUser]);

  return (
    <>
      {/* ✅ FLOATING BUTTON */}
      <ChatButton
        unread={unread}
        onClick={() => {
          connectSocket(currentUser);
          setOpen(true);
          setUnread(0);
        }}
      />

      {/* ✅ CHAT BOX */}
      {open && (
        <ChatBox
          user={selectedUser}
          currentUser={currentUser}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}