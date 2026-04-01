import { createContext, useContext, useEffect, useState } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const getStoredToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken")

  const getStoredUser = () => {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  }

  const [token, setToken] = useState(getStoredToken())
  const [user, setUser] = useState(getStoredUser())
  const [loading, setLoading] = useState(true) // ✅ FIXED

  // 🔹 Load user if token exists but user missing
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (token && !user) {
          const { data } = await api.get("/auth/me")
          setUser(data.user)
          localStorage.setItem("user", JSON.stringify(data.user))
        }
      } catch (error) {
        console.log("Auth error:", error)
        logout()
      } finally {
        setLoading(false) // ✅ NOW VALID
      }
    }

    fetchUser()
  }, [token])

  // 🔹 LOGIN
  const login = (userData, accessToken, refreshToken, keepLoggedIn = true) => {

    if (keepLoggedIn) {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(userData))

      sessionStorage.removeItem("accessToken")
      sessionStorage.removeItem("refreshToken")

    } else {
      sessionStorage.setItem("accessToken", accessToken)
      sessionStorage.setItem("refreshToken", refreshToken)

      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")

      localStorage.setItem("user", JSON.stringify(userData))
    }

    setToken(accessToken)
    setUser(userData)
  }

  // 🔹 LOGOUT
  const logout = () => {
    setUser(null)
    setToken(null)

    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
  }

  // ✅ PREVENT BLANK SCREEN WHILE LOADING
  if (loading) return null

  // ✅ THIS WAS MISSING (CRITICAL)
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)