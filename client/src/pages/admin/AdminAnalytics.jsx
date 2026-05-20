import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import api from "../../services/api"
import { io } from "socket.io-client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts"

import { toast } from "react-toastify"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://real-estate-mern-app-98vu.onrender.com"

const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
]

// ================= COMPONENTS =================
const StatCard = ({ title, value, growth }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border hover:shadow-lg transition">
    <p className="text-sm text-gray-500">{title}</p>
    <h3 className="text-2xl font-bold mt-1">{value}</h3>
    <p className={`text-sm mt-2 ${growth >= 0 ? "text-green-500" : "text-red-500"}`}>
      {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}%
    </p>
  </div>
)

const ChartBox = ({ title, dataKey, color, data }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border hover:shadow-lg transition">
    <h3 className="mb-3 font-semibold">{title}</h3>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={Array.isArray(data) ? data : []}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

const Skeleton = () => (
  <div className="animate-pulse h-40 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
)

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(val || 0)

// ================= MAIN =================
const AdminAnalytics = () => {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [range, setRange] = useState([0, 11])

  const socketRef = useRef(null)
  const cacheRef = useRef({})
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  const from = range[0]
  const to = range[1]

  // ================= YEARS (dynamic) =================
  const years = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => current - i)
  }, [])

  // ================= FETCH =================
  const fetchAnalytics = useCallback(async (showLoader = false) => {
    if (from > to) {
      toast.error("Invalid date range")
      return
    }

    const cacheKey = `${year}-${from}-${to}`

    if (cacheRef.current[cacheKey]) {
      setData(cacheRef.current[cacheKey])
      return
    }

    try {
      if (showLoader) setLoading(true)

      // Cancel previous request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      const res = await api.get(`/admin-analytics/charts`, {
        params: { year, from, to },
        signal: abortRef.current.signal
      })

      const chartData = res?.data?.chartData || []

      const formatted = chartData.map((item, index) => ({
        month: months[from + index] || "",
        users: Number(item.users) || 0,
        agents: Number(item.agents) || 0,
        properties: Number(item.properties) || 0,
        pending: Number(item.pending) || 0,
        blocked: Number(item.blocked) || 0,
        bookings: Number(item.bookings) || 0,
        revenue: Number(item.revenue) || 0
      }))

      cacheRef.current[cacheKey] = formatted
      setData(formatted)

    } catch (error) {
      if (error.name !== "CanceledError") {
        console.error(error)
        toast.error("Failed to load analytics")
      }
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [year, from, to])

  // ================= SOCKET =================
  useEffect(() => {
    const newSocket = io(SOCKET_URL, { withCredentials: true })
    socketRef.current = newSocket

    newSocket.emit("joinAdmin")

    const handleUpdate = () => {
      clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(() => {
        cacheRef.current = {} // invalidate cache
        fetchAnalytics(false)
      }, 500)
    }

    newSocket.on("dashboard:update", handleUpdate)

    return () => {
      clearTimeout(debounceRef.current)
      newSocket.off("dashboard:update", handleUpdate)
      newSocket.disconnect()
    }
  }, [fetchAnalytics])

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchAnalytics(true)
  }, [fetchAnalytics])

  const filteredData = Array.isArray(data) ? data : []

  // ================= TOTALS =================
  const totals = useMemo(() => {
    return filteredData.reduce((acc, cur) => {
      acc.users += cur.users
      acc.agents += cur.agents
      acc.properties += cur.properties
      acc.bookings += cur.bookings
      acc.revenue += cur.revenue
      return acc
    }, {
      users: 0,
      agents: 0,
      properties: 0,
      bookings: 0,
      revenue: 0
    })
  }, [filteredData])

  // ================= GROWTH =================
  const getGrowth = (key) => {
    if (filteredData.length < 2) return 0

    const first = filteredData[0][key] || 0
    const last = filteredData[filteredData.length - 1][key] || 0

    if (first === 0) return last > 0 ? 100 : 0

    return Number((((last - first) / first) * 100).toFixed(1))
  }

  // ================= CONVERSION =================
  const conversionRate = useMemo(() => {
    if (!totals.users) return 0
    return Number(((totals.bookings / totals.users) * 100).toFixed(1))
  }, [totals])

  // ================= INSIGHTS =================
  const insights = useMemo(() => {
    if (!filteredData.length) return []

    return [
      `Users grew by ${getGrowth("users")}%`,
      `Bookings growth is ${getGrowth("bookings")}%`,
      `Conversion rate is ${conversionRate}%`,
      `Revenue trend is ${getGrowth("revenue")}%`
    ]
  }, [filteredData, conversionRate])

  // ================= EXPORT =================
  const formatData = () => filteredData.map(r => ({
    Month: r.month,
    Users: r.users,
    Agents: r.agents,
    Properties: r.properties,
    Bookings: r.bookings,
    Revenue: r.revenue
  }))

  const safeCSV = (value) => `"${String(value).replace(/"/g, '""')}"`

  const exportCSV = () => {
    const data = formatData()
    if (!data.length) return toast.warning("No data to export")

    const headers = Object.keys(data[0]).map(safeCSV).join(",")
    const rows = data.map(r =>
      Object.values(r).map(safeCSV).join(",")
    ).join("\n")

    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" })
    saveAs(blob, "analytics.csv")
  }

  const exportExcel = () => {
    const data = formatData()
    if (!data.length) return toast.warning("No data to export")

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Analytics")

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buffer]), "analytics.xlsx")
  }

  const exportPDF = () => {
    const data = formatData()
    if (!data.length) return toast.warning("No data to export")

    const doc = new jsPDF()
    doc.text("Analytics Report", 14, 15)

    autoTable(doc, {
      startY: 20,
      head: [Object.keys(data[0])],
      body: data.map(row => Object.values(row))
    })

    doc.save("analytics.pdf")
  }

  // ================= UI =================
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">

        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">

          <div>
            <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
            <p className="text-sm text-gray-500">
              Business insights & growth tracking
            </p>
          </div>

          <div className="flex flex-wrap gap-4 items-end">

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 rounded border dark:bg-gray-800"
              >
                {years.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>

            {[{fn:exportCSV,label:"CSV",color:"bg-blue-600"},
              {fn:exportExcel,label:"Excel",color:"bg-green-600"},
              {fn:exportPDF,label:"PDF",color:"bg-red-600"}].map((btn,i)=>(
              <button
                key={i}
                disabled={loading}
                onClick={btn.fn}
                className={`flex items-center gap-1 text-white px-4 py-2 rounded-lg ${btn.color} disabled:opacity-50`}
              >
                <Download size={16}/> {btn.label}
              </button>
            ))}

          </div>
        </div>

        {/* RANGE */}
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <label className="text-xs text-gray-400">From</label>
          <div>
            <select value={from} onChange={(e) => setRange([+e.target.value, to])}
              className="px-3 py-2 rounded border dark:bg-gray-800">
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>

          <label className="text-xs text-gray-400">To</label>
          <div>
            <select value={to} onChange={(e) => setRange([from, +e.target.value])}
              className="px-3 py-2 rounded border dark:bg-gray-800">
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* INSIGHTS */}
        {insights.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-2xl mb-6 space-y-2 shadow">
            {insights.map((text, i) => <p key={i}>• {text}</p>)}
          </div>
        )}

        {/* STATS */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <StatCard title="Users" value={totals.users} growth={getGrowth("users")} />
            <StatCard title="Agents" value={totals.agents} growth={getGrowth("agents")} />
            <StatCard title="Properties" value={totals.properties} growth={getGrowth("properties")} />
            <StatCard title="Bookings" value={totals.bookings} growth={getGrowth("bookings")} />
            <StatCard title="Revenue" value={formatCurrency(totals.revenue)} growth={getGrowth("revenue")} />
          </div>
        )}

        {/* OVERALL */}
        {!loading && filteredData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow mb-6">
            <h3 className="mb-4 font-semibold">Overall Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="users" stroke="#1E3A8A" />
                <Line dataKey="agents" stroke="#7C3AED" />
                <Line dataKey="properties" stroke="#16A34A" />
                <Line dataKey="bookings" stroke="#0D9488" />
                <Line dataKey="revenue" stroke="#F59E0B" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* CHARTS */}
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No analytics data available
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ChartBox title="Users" dataKey="users" color="#1E3A8A" data={filteredData} />
            <ChartBox title="Agents" dataKey="agents" color="#7C3AED" data={filteredData} />
            <ChartBox title="Properties" dataKey="properties" color="#16A34A" data={filteredData} />
            <ChartBox title="Pending" dataKey="pending" color="#EAB308" data={filteredData} />
            <ChartBox title="Blocked" dataKey="blocked" color="#DC2626" data={filteredData} />
            <ChartBox title="Bookings" dataKey="bookings" color="#0D9488" data={filteredData} />
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminAnalytics