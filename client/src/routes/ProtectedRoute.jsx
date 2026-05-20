import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // 🔹 LOADING STATE (NO BLANK SCREEN BUG)
  if (loading) {
    return <div /> // lightweight fallback (can be replaced with global loader)
  }

  // 🔹 NOT AUTHENTICATED
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }} // preserves intended route
      />
    )
  }

  // 🔹 ROLE-BASED ACCESS CONTROL
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  // 🔹 AUTHORIZED
  return children
}

export default ProtectedRoute