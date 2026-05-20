import { useState, useEffect } from "react";

export default function ChatButton({ onClick, unread = 0 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // 🔥 Prevent flicker (small scroll ignore)
      if (Math.abs(currentScroll - lastScrollY) < 5) return;

      if (currentScroll > lastScrollY) {
        setVisible(false); // scrolling down
      } else {
        setVisible(true); // scrolling up
      }

      lastScrollY = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: "50%",
        backgroundColor: "#1877f2",
        color: "#fff",
        display: visible ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 24,
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        zIndex: 9999,
      }}
    >
      💬

      {/* 🔴 Unread Badge */}
      {unread > 0 && (
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            background: "red",
            color: "#fff",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          {unread > 9 ? "9+" : unread}
        </div>
      )}
    </div>
  );
}