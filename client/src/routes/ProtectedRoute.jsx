import { Navigate } from "react-router-dom"

function ProtectedRoute({ children, allowedRoles }) {

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")

  const user = JSON.parse(localStorage.getItem("user"))

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute