import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaHeart, FaCalendarCheck, FaUser } from "react-icons/fa"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts"
import api from "../../services/api"
import io from "socket.io-client"

const socket = io("http://localhost:5000")

const UserDashboard = () => {

  const navigate = useNavigate()

  const [stats, setStats] = useState({
    wishlist: 0,
    visits: 0,
    profileComplete: 0
  })

  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ DARK MODE DETECTION
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    fetchDashboardStats()

    socket.on("dashboardUpdated", () => {
      fetchDashboardStats()
    })

    return () => {
      socket.off("dashboardUpdated")
    }

  }, [])

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      const res = await api.get("/users/dashboard-stats")

      const data = res.data || {}

      const updatedStats = {
        wishlist: data.wishlist || 0,
        visits: data.visits || 0,
        profileComplete: data.profileComplete || 0
      }

      setStats(updatedStats)

      setChartData([
        { name: "Wishlist", value: updatedStats.wishlist },
        { name: "Visits", value: updatedStats.visits },
        { name: "Profile %", value: updatedStats.profileComplete }
      ])

    } catch (err) {
      console.log(err)
      setStats({ wishlist: 0, visits: 0, profileComplete: 0 })
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">
          User Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your activity and manage your account
        </p>
      </div>

      {loading ? (

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
          Loading dashboard...
        </div>

      ) : (

        <>
          {/* CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

            <Card
              icon={<FaHeart className="text-red-500" />}
              title="Wishlist"
              value={stats.wishlist}
              onClick={() => navigate("/user/saved")}
              color="red"
            />

            <Card
              icon={<FaCalendarCheck className="text-green-600" />}
              title="My Visits"
              value={stats.visits}
              onClick={() => navigate("/user/bookings")}
              color="green"
            />

            <Card
              icon={<FaUser className="text-purple-600" />}
              title="Profile"
              value={`${stats.profileComplete}%`}
              onClick={() => navigate("/user/profile")}
              color="purple"
            />

          </div>

          {/* CHART */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">

            <div className="mb-4">
              <h3 className="text-xl font-semibold">
                Activity Overview
              </h3>
              <p className="text-sm text-gray-500">
                Summary of your platform activity
              </p>
            </div>

            {chartData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
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

// ===============================
// CARD COMPONENT
// ===============================
const Card = ({ icon, title, value, onClick, color }) => {

  const colorClasses = {
    red: "bg-red-50 dark:bg-red-900/20",
    green: "bg-green-50 dark:bg-green-900/20",
    purple: "bg-purple-50 dark:bg-purple-900/20"
  }

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl shadow cursor-pointer transition duration-300 hover:shadow-xl hover:scale-[1.02] ${colorClasses[color]}`}
    >
      <div className="text-3xl mb-3">
        {icon}
      </div>

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>
    </div>
  )
}

export default UserDashboard