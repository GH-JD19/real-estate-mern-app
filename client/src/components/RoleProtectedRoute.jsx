import React, { memo, useMemo } from "react"
import { Navigate } from "react-router-dom"

function RoleProtectedRoute({ children, allowedRoles = [] }) {

  // ✅ Safe token retrieval
  const token = useMemo(() => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    )
  }, [])

  // ✅ Safe user parsing (no crash)
  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user")
      return storedUser ? JSON.parse(storedUser) : null
    } catch (err) {
      console.error("Invalid user data in storage:", err)
      return null
    }
  }, [])

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // ❌ Invalid user or role mismatch
  if (
    !user ||
    !user.role ||
    !Array.isArray(allowedRoles) ||
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />
  }

  // ✅ Authorized
  return children
}

export default memo(RoleProtectedRoute)