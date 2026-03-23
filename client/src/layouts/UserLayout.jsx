import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"

const UserLayout = ({ children }) => {

  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">

      {/* Optional role check */}
      {user && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  )
}

export default UserLayout