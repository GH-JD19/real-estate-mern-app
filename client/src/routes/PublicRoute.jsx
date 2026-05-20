import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useMemo } from "react"

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // 🔹 ROLE → DASHBOARD MAP (SCALABLE)
  const roleRedirectMap = useMemo(() => ({
    admin: "/admin-dashboard",
    agent: "/agent-dashboard",
    user: "/user-dashboard"
  }), [])

  // 🔹 LOADING STATE (NO BLANK SCREEN BUG)
  if (loading) {
    return <div />
  }

  // 🔹 IF LOGGED IN → REDIRECT
  if (user) {
    const target = roleRedirectMap[user.role] || "/user-dashboard"

    // ✅ Prevent unnecessary navigation
    if (location.pathname !== target) {
      return <Navigate to={target} replace />
    }
  }

  // 🔹 ALLOW PUBLIC ACCESS
  return children
}

export default PublicRoute