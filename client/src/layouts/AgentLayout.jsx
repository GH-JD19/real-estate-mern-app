import { useState } from "react"
import Sidebar from "../components/Sidebar"

const AgentLayout = ({ children }) => {

  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>

    </div>
  )
}

export default AgentLayout