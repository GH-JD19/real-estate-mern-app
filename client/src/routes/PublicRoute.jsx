import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function PublicRoute({ children }) {
  const { user } = useAuth()

  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />
    }
    if (user.role === "agent") {
      return <Navigate to="/agent-dashboard" replace />
    }
    return <Navigate to="/user-dashboard" replace />
  }

  return children
}

export default PublicRoute