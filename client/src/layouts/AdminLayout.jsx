import { useState, useMemo, useCallback } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { useNotification } from "../context/NotificationContext"

const AdminLayout = () => {

  const [collapsed, setCollapsed] = useState(false)

  const { unread, notifications } = useNotification()

  // 🔹 STABLE TOGGLE (prevents unnecessary re-renders in Sidebar)
  const handleToggle = useCallback(() => {
    setCollapsed(prev => !prev)
  }, [])

  // 🔹 MEMOIZED SIDEBAR PROPS
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
      <Sidebar {...sidebarProps} />

      {/* 🔹 MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  )
}

export default AdminLayout