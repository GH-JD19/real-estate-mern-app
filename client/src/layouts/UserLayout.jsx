import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"

const UserLayout = ({ children }) => {

  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex min-h-[calc(100vh-64px)]">

      {user?.role === "user" && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>

    </div>
  )
}

export default UserLayout