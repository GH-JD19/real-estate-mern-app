import { useState, useMemo, useCallback } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import { useNotification } from "../context/NotificationContext"
import ChatWidget from "../components/chat/ChatWidget";

const UserLayout = () => {

  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

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

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">

      {/* 🔹 SIDEBAR */}
      {user && <Sidebar {...sidebarProps} />}

      {/* 🔹 MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

      {/* 🔥 GLOBAL CHAT (FACEBOOK STYLE) */}
      {user && <ChatWidget currentUser={user} />}

    </div>
  )
}

export default UserLayout