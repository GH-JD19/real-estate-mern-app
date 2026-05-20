import { createContext, useContext, useEffect, useState, useCallback } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  // 🔹 SAFE STORAGE HELPERS
  const getStoredToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken")

  const getStoredUser = () => {
    try {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  // 🔹 STATE
  const [token, setToken] = useState(getStoredToken())
  const [user, setUser] = useState(getStoredUser())
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔹 LOGOUT (STABLE)
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setWishlist([])

    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    sessionStorage.removeItem("accessToken")
    sessionStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
  }, [])

  // 🔹 FETCH USER (ONLY WHEN NEEDED)
  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        if (!user) {
          const { data } = await api.get("/auth/me")

          if (isMounted) {
            setUser(data.user)
            localStorage.setItem("user", JSON.stringify(data.user))
          }
        }
      } catch (error) {
        console.log("Auth error:", error)
        logout()
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchUser()

    return () => {
      isMounted = false
    }
  }, [token, user, logout])

  // ❤️ FETCH WISHLIST
  const fetchWishlist = useCallback(async () => {
    try {
      if (!token) return
      const res = await api.get("/wishlist")

      // Prevent undefined issues
      const properties = res?.data?.properties || []
      setWishlist(properties)
    } catch (err) {
      console.log("Wishlist error:", err)
    }
  }, [token])

  // ❤️ LOAD WISHLIST
  useEffect(() => {
    if (user && token) {
      fetchWishlist()
    } else {
      setWishlist([])
    }
  }, [user, token, fetchWishlist])

  // ❤️ TOGGLE WISHLIST (OPTIMISTIC + SAFE)
  const toggleWishlist = async (propertyId) => {
    if (!propertyId) return

    const exists = wishlist.some((p) => p._id === propertyId)

    // Optimistic update
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p._id !== propertyId))
    } else {
      setWishlist((prev) => {
        if (prev.some((p) => p._id === propertyId)) return prev
        return [...prev, { _id: propertyId }]
      })
    }

    try {
      if (exists) {
        await api.put(`/wishlist/remove/${propertyId}`)
      } else {
        await api.put(`/wishlist/add/${propertyId}`)
      }
    } catch (err) {
      console.log("Wishlist toggle error:", err)

      // Rollback on failure
      fetchWishlist()
    }
  }

  // 🔹 LOGIN
  const login = (userData, accessToken, refreshToken, keepLoggedIn = true) => {
    if (!accessToken || !userData) return

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

  // 🔹 CONTEXT VALUE (MEMO NOT REQUIRED - KEEP SIMPLE)
  const value = {
    user,
    token,
    login,
    logout,
    loading,
    wishlist,
    toggleWishlist
  }

  // 🔹 LOADING FIX (IMPORTANT)
  if (loading) return <div /> // Prevent blank screen crash in production

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 🔹 HOOK
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}