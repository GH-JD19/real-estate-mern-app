import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from "react"
import socket from "../services/socket"
import { useAuth } from "./AuthContext"
import toast from "react-hot-toast"

const NotificationContext = createContext()

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const NotificationProvider = ({ children }) => {

  const { user } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  const isConnected = useRef(false)
  const audioRef = useRef(null)
  const isMounted = useRef(true)

  // ================= TOKEN =================
  const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken")

  const getAuthHeaders = useCallback(() => {
    const token = getToken()
    return token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      : {}
  }, [])

  // ================= FETCH =================
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: getAuthHeaders()
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error("Fetch failed:", data)
        return
      }

      const list = data.notifications || []

      if (!isMounted.current) return

      setNotifications(list)
      setUnread(list.filter(n => !n.read).length)

    } catch (err) {
      console.log("Fetch error:", err)
    }
  }, [getAuthHeaders])

  // ================= MARK ONE =================
  const markAsRead = useCallback(async (id) => {
    if (!id) return

    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PUT",
        headers: getAuthHeaders()
      })

      if (!res.ok) return

      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      )

      setUnread(prev => Math.max(prev - 1, 0))

    } catch (err) {
      console.log("markAsRead error:", err)
    }
  }, [getAuthHeaders])

  // ================= MARK ALL =================
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PUT",
        headers: getAuthHeaders()
      })

      if (!res.ok) return

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)

    } catch (err) {
      console.log("markAll error:", err)
    }
  }, [getAuthHeaders])

  // ================= SOCKET =================
  useEffect(() => {

    if (!user) return

    // connect once
    if (!isConnected.current) {
      socket.connect()
      isConnected.current = true
    }

    // init audio once
    if (!audioRef.current) {
      audioRef.current = new Audio("/notification.mp3")
      audioRef.current.volume = 0.7
    }

    // join rooms
    if (user.role === "admin") socket.emit("joinAdmin")
    if (user.role === "agent") socket.emit("joinAgent")
    if (user.role === "user") socket.emit("joinUser", user._id)

    const handleUpdate = (data) => {
      if (!data || !data._id) return

      setNotifications(prev => {
        // prevent duplicates
        if (prev.some(n => n._id === data._id)) return prev
        return [{ ...data, read: false }, ...prev]
      })

      setUnread(prev => prev + 1)

      // toast
      if (data.message) {
        toast.success(data.message)
      }

      // sound (safe play)
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }
    }

    socket.on("dashboard:update", handleUpdate)
    socket.on("agent:update", handleUpdate)
    socket.on("user:update", handleUpdate)

    return () => {
      socket.off("dashboard:update", handleUpdate)
      socket.off("agent:update", handleUpdate)
      socket.off("user:update", handleUpdate)
    }

  }, [user])

  // ================= INITIAL LOAD =================
  useEffect(() => {
    isMounted.current = true

    const token = getToken()
    if (user && token) {
      fetchNotifications()
    }

    return () => {
      isMounted.current = false
    }
  }, [user, fetchNotifications])

  // ================= CONTEXT VALUE =================
  const value = useMemo(() => ({
    notifications,
    unread,
    setUnread,
    setNotifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications
  }), [notifications, unread, markAsRead, markAllAsRead, fetchNotifications])

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// ================= HOOK =================
export const useNotification = () => {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }

  return context
}