import { createContext, useContext, useEffect, useState } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  const getStoredToken = () =>
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")

  const getStoredUser = () => {
    const stored = localStorage.getItem("user")
    return stored ? JSON.parse(stored) : null
  }

  const [token, setToken] = useState(getStoredToken())
  const [user, setUser] = useState(getStoredUser())

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
        logout()
      }
    }

    fetchUser()
  }, [token])

  // 🔹 LOGIN
  const login = (userData, jwtToken, keepLoggedIn = true) => {

    if (keepLoggedIn) {
      localStorage.setItem("token", jwtToken)
      localStorage.setItem("user", JSON.stringify(userData))
      sessionStorage.removeItem("token")
    } else {
      sessionStorage.setItem("token", jwtToken)
      localStorage.removeItem("token")
      localStorage.setItem("user", JSON.stringify(userData))
    }

    setToken(jwtToken)
    setUser(userData)
  }

  // 🔹 LOGOUT
  const logout = () => {
    setUser(null)
    setToken(null)

    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)