import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaHeart, FaCalendarCheck, FaUser } from "react-icons/fa"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts"
import api from "../../services/api"

const UserDashboard = () => {

  const navigate = useNavigate()

  const [stats, setStats] = useState({
    wishlist: 0,
    visits: 0,
    profileComplete: 0
  })

  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {

      const res = await api.get("/users/dashboard-stats")

      const data = res.data || {}

      setStats({
        wishlist: data.wishlist || 0,
        visits: data.visits || 0,
        profileComplete: data.profileComplete || 0
      })

      setChartData([
        { name: "Wishlist", value: data.wishlist || 0 },
        { name: "Visits", value: data.visits || 0 },
        { name: "Profile %", value: data.profileComplete || 0 }
      ])

    } catch (err) {
      console.log(err)
      setStats({ wishlist: 0, visits: 0, profileComplete: 0 })
      setChartData([])
    }
  }

  return (
    <div>

      <h2 className="text-2xl font-semibold mb-6">
        User Dashboard
      </h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

        <Card
          icon={<FaHeart className="text-red-500" />}
          title="Wishlist"
          value={stats.wishlist}
          onClick={() => navigate("/user/saved")}
        />

        <Card
          icon={<FaCalendarCheck className="text-green-600" />}
          title="My Visits"
          value={stats.visits}
          onClick={() => navigate("/user/bookings")}
        />

        <Card
          icon={<FaUser className="text-purple-600" />}
          title="Profile"
          value={`${stats.profileComplete}%`}
          onClick={() => navigate("/user/profile")}
        />

      </div>

      {/* Chart */}
      <h3 className="text-xl font-semibold mb-4">
        Activity Overview
      </h3>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563EB" />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  )
}

const Card = ({ icon, title, value, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
  >
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
)

export default UserDashboard