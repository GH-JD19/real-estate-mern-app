import { useState } from "react"
import Sidebar from "../components/Sidebar"
import { useNotification } from "../context/NotificationContext"

const AgentLayout = ({ children }) => {

  const [collapsed, setCollapsed] = useState(false)

  const { unread, notifications } = useNotification()

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        unread={unread}
        notifications={notifications}
      />

      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  )
}

export default AgentLayout