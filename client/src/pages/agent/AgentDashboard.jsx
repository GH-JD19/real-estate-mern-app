import { useEffect, useState, useRef } from "react"
import api from "../../services/api"
import { Link } from "react-router-dom"
import { io } from "socket.io-client"
import { LabelList } from "recharts"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://real-estate-mern-app-98vu.onrender.com"

const STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
}

const AgentDashboard = () => {

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  const socketRef = useRef(null)
  const abortRef = useRef(null)
  const latestRequest = useRef(0)

  // ================= SOCKET =================
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true })
    socketRef.current = socket

    const agentId = JSON.parse(localStorage.getItem("user"))?._id
    if (agentId) socket.emit("joinAgent", agentId)

    socket.on("dashboard:update", () => {
      fetchStats()
    })

    return () => {
      socket.off("dashboard:update")
      socket.disconnect()
    }
  }, [])

  // ================= DARK MODE =================
  useEffect(() => {
    const updateTheme = () => {
      setDarkMode(document.documentElement.classList.contains("dark"))
    }

    updateTheme()

    window.addEventListener("storage", updateTheme)

    return () => {
      window.removeEventListener("storage", updateTheme)
    }
  }, [])

  // ================= FETCH =================
  const fetchStats = async () => {

    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    const requestId = Date.now()
    latestRequest.current = requestId

    try {
      setLoading(true)
      setError("")

      const res = await api.get("/properties/my", {
        params: { limit: 50 }, // 🔥 optimized
        signal: controller.signal,
        timeout: 10000
      })

      if (latestRequest.current !== requestId) return

      const properties = res.data.properties || []
      const total = res.data.total || properties.length

      let pending = 0, approved = 0, rejected = 0

      for (const p of properties) {
        if (p.status === STATUS.PENDING) pending++
        else if (p.status === STATUS.APPROVED) approved++
        else if (p.status === STATUS.REJECTED) rejected++
      }

      const safeStats = {
        total: total || 0,
        pending,
        approved,
        rejected
      }

      setStats(safeStats)

      setChartData([
        { name: "Total", value: safeStats.total },
        { name: "Pending", value: safeStats.pending },
        { name: "Approved", value: safeStats.approved },
        { name: "Rejected", value: safeStats.rejected }
      ])

    } catch (err) {
      if (err.name === "CanceledError") return

      if (latestRequest.current !== requestId) return

      setError(err?.response?.data?.message || "Failed to load dashboard data")

    } finally {
      if (latestRequest.current === requestId) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchStats()

    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Agent Dashboard
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Overview of your property listings
        </p>
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-500">
          Loading dashboard...
        </div>
      )}

      {error && (
        <div className="text-center py-10 text-red-500 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">

            <DashboardLink to="/agent/all-properties">
              <Stat title="Total" value={stats.total} color="bg-blue-500" />
            </DashboardLink>

            <DashboardLink to="/agent/pending-properties">
              <Stat title="Pending" value={stats.pending} color="bg-yellow-500" />
            </DashboardLink>

            <DashboardLink to="/agent/my-listings">
              <Stat title="Approved" value={stats.approved} color="bg-green-500" />
            </DashboardLink>

            <DashboardLink to="/agent/rejected-properties">
              <Stat title="Rejected" value={stats.rejected} color="bg-red-500" />
            </DashboardLink>

          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">

            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-white">
              Listing Overview
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "#374151" : "#e5e7eb"}
                />

                <XAxis
                  dataKey="name"
                  stroke={darkMode ? "#e5e7eb" : "#374151"}
                  tick={{ fill: darkMode ? "#e5e7eb" : "#374151" }}
                />

                <YAxis
                  stroke={darkMode ? "#e5e7eb" : "#374151"}
                  tick={{ fill: darkMode ? "#e5e7eb" : "#374151" }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#374151" : "#e5e7eb",
                    border: "none",
                    borderRadius: "8px"
                  }}
                  labelStyle={{ color: darkMode ? "#e5e7eb" : "#374151" }}
                  itemStyle={{ color: darkMode ? "#e5e7eb" : "#374151" }}
                />

                <Bar
                  dataKey="value"
                  fill={darkMode ? "#22c55e" : "#16a34a"}
                  radius={[8, 8, 0, 0]}
                  minPointSize={5}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    fill={darkMode ? "#e5e7eb" : "#111827"}
                    fontSize={12}
                  />
                </Bar>

              </BarChart>
            </ResponsiveContainer>

          </div>
        </>
      )}
    </div>
  )
}

const DashboardLink = ({ to, children }) => (
  <Link to={to} className="block">
    {children}
  </Link>
)

const Stat = ({ title, value, color }) => (
  <div className={`
    ${color}
    text-white
    p-4 sm:p-5
    rounded-2xl
    shadow-md
    text-center
    transition
    duration-300
    hover:scale-105
    hover:shadow-lg
  `}>
    <h4 className="text-sm sm:text-base opacity-90">{title}</h4>
    <p className="text-xl sm:text-2xl font-bold mt-1">{value ?? 0}</p>
  </div>
)

export default AgentDashboard