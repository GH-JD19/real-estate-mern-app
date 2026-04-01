import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import { useNotification } from "../context/NotificationContext"

const UserLayout = ({ children }) => {

  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

  const { unread, notifications } = useNotification()

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">

      {user && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          unread={unread}
          notifications={notifications}
        />
      )}

      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  )
}

export default UserLayout