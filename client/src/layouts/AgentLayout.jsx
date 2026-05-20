import { useState, useMemo, useCallback } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { useNotification } from "../context/NotificationContext"
import ChatWidget from "../components/chat/ChatWidget";

const AgentLayout = () => {

  const [collapsed, setCollapsed] = useState(false)
  const { unread, notifications } = useNotification()

  const handleToggle = useCallback(() => {
    setCollapsed(prev => !prev)
  }, [])

  const sidebarProps = useMemo(() => ({
    collapsed,
    setCollapsed,
    toggleCollapsed: handleToggle,
    unread,
    notifications
  }), [collapsed, handleToggle, unread, notifications])

  // ✅ GET USER (IMPORTANT)
  const user = JSON.parse(localStorage.getItem("user"))

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">

      {/* 🔹 SIDEBAR */}
      <Sidebar {...sidebarProps} />

      {/* 🔹 MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

      {/* 🔥 ADD CHAT HERE (GLOBAL) */}
      <ChatWidget currentUser={user} />

    </div>
  )
}

export default AgentLayout