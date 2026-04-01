import { createContext, useContext, useEffect, useState, useRef } from "react"
import socket from "../services/socket"
import { useAuth } from "./AuthContext"
import toast from "react-hot-toast"

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {

  const { user } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  const isConnected = useRef(false)
  const audioRef = useRef(null)

  // ================= AUTH HEADER =================
  const getToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    )
  }

  const getAuthHeaders = () => {
    const token = getToken()

    if (!token) return {}

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }

  // ================= FETCH =================
  const fetchNotifications = async () => {
    try {

      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: getAuthHeaders()
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Fetch failed:", data)
        return
      }

      setNotifications(data.notifications || [])

      const unreadCount = (data.notifications || []).filter(n => !n.read).length
      setUnread(unreadCount)

    } catch (err) {
      console.log("Fetch error:", err)
    }
  }

  // ================= MARK ONE =================
  const markAsRead = async (id) => {
    try {

      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: getAuthHeaders()
      })

      if (!res.ok) return

      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      )

      setUnread(prev => Math.max(prev - 1, 0))

    } catch (err) {
      console.log(err)
    }
  }

  // ================= MARK ALL =================
  const markAllAsRead = async () => {
    try {

      const res = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: getAuthHeaders()
      })

      if (!res.ok) return

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)

    } catch (err) {
      console.log(err)
    }
  }

  // ================= SOCKET =================
  useEffect(() => {

    if (!user) return

    // connect only once
    if (!isConnected.current) {
      socket.connect()
      isConnected.current = true
    }

    // initialize audio once
    if (!audioRef.current) {
      audioRef.current = new Audio("/notification.mp3")
    }

    // join rooms
    if (user.role === "admin") socket.emit("joinAdmin")
    if (user.role === "agent") socket.emit("joinAgent")
    if (user.role === "user") socket.emit("joinUser", user._id)

    const handleUpdate = (data) => {

      const newNotification = {
        ...data,
        read: false
      }

      setNotifications(prev => [newNotification, ...prev])
      setUnread(prev => prev + 1)

      // toast
      toast.success(data.message)

      // sound
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
    const token = getToken()

    if (user && token) {
      fetchNotifications()
    }
  }, [user])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread,
        setUnread,
        setNotifications,
        markAsRead,
        markAllAsRead,
        fetchNotifications // optional manual refresh
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)