import { useEffect, useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FaHeart, FaCalendarCheck, FaUser } from "react-icons/fa"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts"
import api from "../../services/api"
import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const UserDashboard = () => {

  const navigate = useNavigate()

  const [stats, setStats] = useState({
    wishlist: 0,
    visits: 0,
    profileComplete: 0
  })

  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDark, setIsDark] = useState(false)

  const socketRef = useRef(null)
  const abortRef = useRef(null)
  const latestRequest = useRef(0)

  // ================= THEME DETECTION =================
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    updateTheme()

    window.addEventListener("storage", updateTheme)

    return () => window.removeEventListener("storage", updateTheme)
  }, [])

  // ================= FETCH =================
  const fetchDashboardStats = useCallback(async () => {

    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    const requestId = Date.now()
    latestRequest.current = requestId

    try {
      setLoading(true)
      setError("")

      const res = await api.get("/users/dashboard-stats", {
        signal: controller.signal,
        timeout: 10000
      })

      if (latestRequest.current !== requestId) return

      const data = res?.data || {}

      const updatedStats = {
        wishlist: data.wishlist || 0,
        visits: data.visits || 0,
        profileComplete: data.profileComplete || 0
      }

      setStats(updatedStats)

      setChartData([
        { name: "Wishlist", value: updatedStats.wishlist },
        { name: "Visits", value: updatedStats.visits },
        { name: "Profile", value: updatedStats.profileComplete }
      ])

    } catch (err) {
      if (err.name === "CanceledError") return
      if (latestRequest.current !== requestId) return

      setError("Failed to load dashboard")
    } finally {
      if (latestRequest.current === requestId) {
        setLoading(false)
      }
    }

  }, [])

  // ================= SOCKET =================
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true })
    socketRef.current = socket

    const userId = JSON.parse(localStorage.getItem("user"))?._id
    if (userId) socket.emit("joinUser", userId)

    socket.on("dashboardUpdated", fetchDashboardStats)

    fetchDashboardStats()

    return () => {
      socket.off("dashboardUpdated", fetchDashboardStats)
      socket.disconnect()
    }
  }, [fetchDashboardStats])

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">
          Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back 👋
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 mb-4 rounded text-center">
          {error}
        </div>
      )}

      {loading ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>

      ) : (

        <>
          {/* CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

            <Card icon={<FaHeart />} title="Wishlist" value={stats.wishlist}
              onClick={() => navigate("/user/saved")} color="red" />

            <Card icon={<FaCalendarCheck />} title="Visits" value={stats.visits}
              onClick={() => navigate("/user/bookings")} color="green" />

            <Card icon={<FaUser />} title="Profile"
              value={`${stats.profileComplete}%`}
              onClick={() => navigate("/user/profile")} color="purple" />

          </div>

          {/* CHART */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">

            <h3 className="text-xl font-semibold mb-4">
              Activity Overview
            </h3>

            {chartData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No activity yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill={isDark ? "#60A5FA" : "#2563EB"}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

          </div>
        </>
      )}
    </div>
  )
}

// ================= CARD =================
const Card = ({ icon, title, value, onClick, color }) => {

  const colors = {
    red: "bg-red-100 dark:bg-red-900/20 text-red-600",
    green: "bg-green-100 dark:bg-green-900/20 text-green-600",
    purple: "bg-purple-100 dark:bg-purple-900/20 text-purple-600"
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick()
      }}
      className="p-6 rounded-2xl shadow cursor-pointer transition hover:shadow-xl hover:scale-[1.03] bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
    >
      <div className={`text-3xl mb-3 ${colors[color]}`}>
        {icon}
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value ?? 0}</p>
    </div>
  )
}

export default UserDashboard