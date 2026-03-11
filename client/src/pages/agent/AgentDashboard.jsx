import { useEffect, useState } from "react"
import api from "../../services/api"
import { Link } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const AgentDashboard = () => {

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
  try {

    const res = await api.get("/properties/my?limit=100")

    const properties = res.data.properties || []

    const total = res.data.total || properties.length
    const pending = properties.filter(p => p.status === "PENDING").length
    const approved = properties.filter(p => p.status === "APPROVED").length
    const rejected = properties.filter(p => p.status === "REJECTED").length

    setStats({ total, pending, approved, rejected })

    setChartData([
      { name: "Total", value: total },
      { name: "Pending", value: pending },
      { name: "Approved", value: approved },
      { name: "Rejected", value: rejected }
    ])

  } catch (err) {
    console.log(err)
  }
}

  return (
    <div>

      <h2 className="text-2xl font-bold mb-6">
        Agent Dashboard
      </h2>

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <Link to="/agent/all-properties">
          <Stat title="Total" value={stats.total} color="bg-blue-500" />
        </Link>

        <Link to="/agent/pending-properties">
          <Stat title="Pending" value={stats.pending} color="bg-yellow-500" />
        </Link>

        <Link to="/agent/my-listings">
          <Stat title="Approved" value={stats.approved} color="bg-green-500" />
        </Link>

        <Link to="/agent/rejected-properties">
          <Stat title="Rejected" value={stats.rejected} color="bg-red-500" />
        </Link>

      </div>

      <h3 className="text-xl font-semibold mb-4">
        Listing Overview
      </h3>

      <div className="bg-white p-4 rounded shadow">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#16A34A" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

const Stat = ({ title, value, color }) => (
  <div className={`${color} text-white p-5 rounded-xl shadow-md text-center hover:scale-105 transition cursor-pointer`}>
    <h4>{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
)

export default AgentDashboard