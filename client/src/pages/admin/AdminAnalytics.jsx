import { useState, useEffect } from "react"
import api from "../../services/api"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
]

const AdminAnalytics = () => {

  const [data, setData] = useState([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {

      const res = await api.get("/admin/charts")

      const formatted = res.data.chartData.map((item, index) => ({
        month: months[index],
        users: item.users || 0,
        agents: item.agents || 0,
        properties: item.properties || 0,
        pending: item.pending || 0,
        blocked: item.blocked || 0,
        bookings: item.bookings || 0
      }))

      setData(formatted)

    } catch (error) {
      console.log("Analytics error:", error)
    }
  }

  const ChartBox = ({ title, dataKey, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="font-semibold mb-3">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line dataKey={dataKey} stroke={color} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6 text-gray-900 dark:text-white">

      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <ChartBox title="User Growth" dataKey="users" color="#1E3A8A" />

        <ChartBox title="Agent Growth" dataKey="agents" color="#7C3AED" />

        <ChartBox title="Property Growth" dataKey="properties" color="#16A34A" />

        <ChartBox title="Pending Properties" dataKey="pending" color="#EAB308" />

        <ChartBox title="Blocked Users" dataKey="blocked" color="#DC2626" />

        <ChartBox title="Bookings" dataKey="bookings" color="#0D9488" />

      </div>

    </div>
  )
}

export default AdminAnalytics