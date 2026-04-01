import { Navigate } from "react-router-dom"

function RoleProtectedRoute({ children, allowedRoles }) {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken")

  const user = JSON.parse(localStorage.getItem("user"))

  if (!token) {
    return <Navigate to="/login" />
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />
  }

  return children
}

export default RoleProtectedRoute