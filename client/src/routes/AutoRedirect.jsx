import { useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function AutoRedirect({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // 🔹 PUBLIC ROUTES (MEMOIZED)
  const publicPaths = useMemo(() => ([
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password"
  ]), [])

  // 🔹 ROLE → DASHBOARD MAP
  const roleRedirectMap = useMemo(() => ({
    admin: "/admin-dashboard",
    agent: "/agent-dashboard",
    user: "/user-dashboard"
  }), [])

  useEffect(() => {
    if (!user) return

    const currentPath = location.pathname

    // ✅ Skip public routes
    if (publicPaths.includes(currentPath)) return

    // ✅ Only redirect from root
    if (currentPath !== "/") return

    const target = roleRedirectMap[user.role] || "/user-dashboard"

    // ✅ Prevent unnecessary navigation
    if (currentPath !== target) {
      navigate(target, { replace: true })
    }

  }, [user, location.pathname, navigate, publicPaths, roleRedirectMap])

  return children
}

export default AutoRedirect