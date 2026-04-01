import { useEffect, useState } from "react"
import api from "../../services/api"
import { Link } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

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

  // Detect dark mode
  const checkDarkMode = () =>
    document.documentElement.classList.contains("dark")

  useEffect(() => {
    setDarkMode(checkDarkMode())

    const observer = new MutationObserver(() => {
      setDarkMode(checkDarkMode())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchStats = async () => {
      try {
        setLoading(true)

        const res = await api.get("/properties/my?limit=100")
        const properties = res.data.properties || []

        const total = res.data.total || properties.length
        const pending = properties.filter(p => p.status === "PENDING").length
        const approved = properties.filter(p => p.status === "APPROVED").length
        const rejected = properties.filter(p => p.status === "REJECTED").length

        if (isMounted) {
          setStats({ total, pending, approved, rejected })

          setChartData([
            { name: "Total", value: total },
            { name: "Pending", value: pending },
            { name: "Approved", value: approved },
            { name: "Rejected", value: rejected }
          ])
        }

      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError("Failed to load dashboard data")
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchStats()

    return () => {
      isMounted = false
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

      {/* LOADING */}
      {loading && (
        <div className="text-center py-20 text-gray-500">
          Loading dashboard...
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-center py-10 text-red-500 font-medium">
          {error}
        </div>
      )}

      {/* CONTENT */}
      {!loading && !error && (
        <>
          {/* STATS */}
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

          {/* CHART SECTION */}
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
                  stroke={darkMode ? "#d1d5db" : "#374151"}
                />

                <YAxis
                  stroke={darkMode ? "#d1d5db" : "#374151"}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    color: darkMode ? "#ffffff" : "#000000"
                  }}
                />

                <Bar
                  dataKey="value"
                  fill={darkMode ? "#22c55e" : "#16a34a"}
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </>
      )}

    </div>
  )
}

/* LINK WRAPPER */
const DashboardLink = ({ to, children }) => (
  <Link to={to} className="block">
    {children}
  </Link>
)

/* STAT CARD */
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
    <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
  </div>
)

export default AgentDashboard