import { useState } from "react"
import Sidebar from "../components/Sidebar"

const AgentLayout = ({ children }) => {

  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  )
}

export default AgentLayout