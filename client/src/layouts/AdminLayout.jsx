import { useState } from "react"
import Sidebar from "../components/Sidebar"

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  )
}

export default AdminLayout