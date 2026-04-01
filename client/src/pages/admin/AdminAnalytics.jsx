import { useState, useEffect, useMemo, useCallback } from "react"
import api from "../../services/api"
import socket from "../../services/socket"

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

const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
]

const AdminAnalytics = () => {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [range, setRange] = useState([0, 11])

  const from = range[0]
  const to = range[1]

  // 💰 Currency Formatter
  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val)

  // 🔥 Fetch Analytics
  const fetchAnalytics = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true)

      const res = await api.get(`/admin-analytics/charts`, {
        params: { year, from, to }
      })

      const chartData = res?.data?.chartData || []

      const formatted = chartData.map((item, index) => ({
        month: months[index + from],
        users: item.users || 0,
        agents: item.agents || 0,
        properties: item.properties || 0,
        pending: item.pending || 0,
        blocked: item.blocked || 0,
        bookings: item.bookings || 0,
        revenue: item.revenue || 0
      }))

      setData(formatted)

    } catch (error) {
      console.error(error)
      toast.error("Failed to load analytics")
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [year, from, to])

  // 🚀 REAL-TIME SOCKET
  useEffect(() => {

    fetchAnalytics(true)

    if (!socket.connected) {
      socket.connect()
      socket.emit("joinAdmin")
    }

    const handleUpdate = () => {
      console.log("Realtime analytics update")
      fetchAnalytics(false)
    }

    socket.on("dashboard:update", handleUpdate)

    return () => {
      socket.off("dashboard:update", handleUpdate)
    }

  }, [fetchAnalytics])

  const filteredData = useMemo(() => data, [data])

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

  const getGrowth = (key) => {
    if (filteredData.length < 2) return 0
    const first = filteredData[0][key]
    const last = filteredData[filteredData.length - 1][key]
    if (first === 0 && last === 0) return 0
    if (first === 0) return 100
    return (((last - first) / first) * 100).toFixed(1)
  }

  const conversionRate = useMemo(() => {
    if (totals.users === 0) return 0
    return ((totals.bookings / totals.users) * 100).toFixed(1)
  }, [totals])

  const insights = useMemo(() => {
    return [
      `📈 Users grew by ${getGrowth("users")}%`,
      `📊 Bookings growth is ${getGrowth("bookings")}%`,
      `🎯 Conversion rate is ${conversionRate}%`,
      `💰 Revenue trend is ${getGrowth("revenue")}%`
    ]
  }, [filteredData, totals])

  // 📤 Format Data
  const formatData = () => filteredData.map(r => ({
    Month: r.month,
    Users: r.users,
    Agents: r.agents,
    Properties: r.properties,
    Bookings: r.bookings,
    Revenue: r.revenue
  }))

  // 📄 CSV
  const exportCSV = () => {
    const data = formatData()
    if (!data.length) return

    const headers = Object.keys(data[0]).join(",")
    const rows = data.map(r => Object.values(r).join(",")).join("\n")
    const csv = headers + "\n" + rows

    const blob = new Blob([csv], { type: "text/csv" })
    saveAs(blob, "analytics.csv")
  }

  // 📊 Excel
  const exportExcel = () => {
    const data = formatData()
    if (!data.length) return

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Analytics")

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })

    saveAs(new Blob([buffer]), "analytics.xlsx")
  }

  // 📄 PDF
  const exportPDF = () => {
    const data = formatData()
    if (!data.length) return

    const doc = new jsPDF()
    doc.text("Analytics Report", 14, 15)

    autoTable(doc, {
      startY: 20,
      head: [Object.keys(data[0])],
      body: data.map(row => Object.values(row))
    })

    doc.save("analytics.pdf")
  }

  const StatCard = ({ title, value, growth }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border hover:shadow-lg transition">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
      <p className={`text-sm mt-2 ${growth >= 0 ? "text-green-500" : "text-red-500"}`}>
        {growth >= 0 ? "▲" : "▼"} {growth}%
      </p>
    </div>
  )

  const ChartBox = ({ title, dataKey, color }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border hover:shadow-lg transition">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={filteredData}>
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
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>

            <button onClick={exportCSV} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <Download size={16}/> CSV
            </button>

            <button onClick={exportExcel} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg">
              <Download size={16}/> Excel
            </button>

            <button onClick={exportPDF} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg">
              <Download size={16}/> PDF
            </button>

          </div>
        </div>

        {/* RANGE */}
        <div className="flex flex-wrap gap-4 mb-6">
          <label className="text-xs text-gray-400 mb-1">From</label>
          <select value={from} onChange={(e) => setRange([+e.target.value, to])}
            className="px-3 py-2 rounded border dark:bg-gray-800">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>

          <label className="text-xs text-gray-400 mb-1">To</label>
          <select value={to} onChange={(e) => setRange([from, +e.target.value])}
            className="px-3 py-2 rounded border dark:bg-gray-800">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>

        {/* INSIGHTS */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-2xl mb-6 space-y-2 shadow">
          {insights.map((text, i) => <p key={i}>• {text}</p>)}
        </div>

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
                <Line dataKey="users" stroke="#1E3A8A" animationDuration={800} />
                <Line dataKey="agents" stroke="#7C3AED" animationDuration={800} />
                <Line dataKey="properties" stroke="#16A34A" animationDuration={800} />
                <Line dataKey="bookings" stroke="#0D9488" animationDuration={800} />
                <Line dataKey="revenue" stroke="#F59E0B" animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

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
            <ChartBox title="Users" dataKey="users" color="#1E3A8A" />
            <ChartBox title="Agents" dataKey="agents" color="#7C3AED" />
            <ChartBox title="Properties" dataKey="properties" color="#16A34A" />
            <ChartBox title="Pending" dataKey="pending" color="#EAB308" />
            <ChartBox title="Blocked" dataKey="blocked" color="#DC2626" />
            <ChartBox title="Bookings" dataKey="bookings" color="#0D9488" />
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminAnalytics