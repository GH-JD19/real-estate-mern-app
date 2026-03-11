import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function AutoRedirect({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) return

    // Avoid redirect loop
    const publicPaths = ["/login", "/register"]

    if (publicPaths.includes(location.pathname)) return

    if (location.pathname === "/") {
      if (user.role === "admin") {
        navigate("/admin-dashboard", { replace: true })
      } else if (user.role === "agent") {
        navigate("/agent-dashboard", { replace: true })
      } else {
        navigate("/user-dashboard", { replace: true })
      }
    }
  }, [user])

  return children
}

export default AutoRedirect