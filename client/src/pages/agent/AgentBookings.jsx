import { useEffect, useState, useRef } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { io } from "socket.io-client"
import { Download } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AgentBookings = () => {

  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [exporting, setExporting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const socketRef = useRef(null)
  const abortRef = useRef(null)
  const latestRequest = useRef(0)
  const debounceRef = useRef(null)

  // ================= SOCKET =================
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true })

    socketRef.current = socket

    socket.emit("joinAgent")

    socket.on("visitUpdated", () => {
      fetchBookings(currentPage)
    })

    return () => {
      socket.off("visitUpdated")
      socket.disconnect()
    }
  }, [])

  // ================= FETCH =================
  const fetchBookings = async (page = 1, searchValue = search) => {

    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    const requestId = Date.now()
    latestRequest.current = requestId

    try {
      setLoading(true)
      setError("")

      const res = await api.get(`/visits/agent`, {
        params: {
          page,
          limit: 5,
          search: searchValue,
          status: statusFilter,
          date: dateFilter
        },
        signal: controller.signal,
        timeout: 10000
      })

      if (latestRequest.current !== requestId) return

      setBookings(res.data.visits || [])
      setFilteredBookings(res.data.visits || [])
      setCurrentPage(res.data.currentPage)
      setTotalPages(res.data.totalPages)

    } catch (err) {
      if (err.name === "CanceledError") return

      if (latestRequest.current !== requestId) return

      toast.error(err?.response?.data?.message || "Failed to fetch bookings")
      setError("Failed to fetch bookings")
      setBookings([])
      setFilteredBookings([])

    } finally {
      if (latestRequest.current === requestId) {
        setLoading(false)
      }
    }
  }

  // ================= DEBOUNCED SEARCH =================
  useEffect(() => {
    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchBookings(1)
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [search, statusFilter, dateFilter])

  useEffect(() => {
    fetchBookings(currentPage)
  }, [currentPage])

  // ================= EXPORT =================
  const fetchAllData = async () => {
    try {
      const res = await api.get(`/visits/agent`, {
        params: {
          limit: 1000,
          search,
          status: statusFilter,
          date: dateFilter
        }
      })
      return res.data.visits || []
    } catch {
      toast.error("Export failed")
      return []
    }
  }

  const formatData = (data) =>
    data.map(b => ({
      User: b.user?.name || "N/A",
      Property: b.property?.title || "N/A",
      Date: b.visitDate ? new Date(b.visitDate).toLocaleDateString() : "N/A",
      Status: b.status
    }))

  const exportHandler = async (type) => {
    setExporting(true)

    const data = formatData(await fetchAllData())
    if (!data.length) {
      setExporting(false)
      return
    }

    if (type === "csv") {
      const csv = Papa.unparse(data)
      saveAs(new Blob([csv]), "visits.csv")
    }

    if (type === "excel") {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Visits")
      XLSX.writeFile(wb, "visits.xlsx")
    }

    if (type === "pdf") {
      const doc = new jsPDF()
      autoTable(doc, {
        head: [["User", "Property", "Date", "Status"]],
        body: data.map(item => Object.values(item))
      })
      doc.save("visits.pdf")
    }

    setExporting(false)
  }

  // ================= STATUS UPDATE =================
  const updateStatus = async (id, status) => {
    if (!window.confirm("Are you sure?")) return

    try {
      setUpdatingId(id)

      await api.patch(`/visits/${id}`, { status })

      toast.success(`Visit ${status.toLowerCase()} successfully`)

      fetchBookings(currentPage)

    } catch {
      toast.error("Status update failed")
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border border-green-300"
      case "REJECTED":
        return "bg-red-100 text-red-700 border border-red-300"
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    }
  }

  return (
    <div className="p-4 md:p-6">

      {error && (
        <div className="bg-red-100 text-red-600 p-3 mb-4 rounded text-center">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Visit Requests
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Manage and respond to property visit requests
          </p>
        </div>

        <div className="flex gap-2">

          <button onClick={() => exportHandler("csv")}
            disabled={exporting}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
            <Download size={16}/> CSV
          </button>

          <button onClick={() => exportHandler("excel")}
            disabled={exporting}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
            <Download size={16}/> Excel
          </button>

          <button onClick={() => exportHandler("pdf")}
            disabled={exporting}
            className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
            <Download size={16}/> PDF
          </button>

        </div>

      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 border dark:border-gray-700 flex flex-col md:flex-row gap-4 md:items-center justify-between">

        <input
          type="text"
          placeholder="Search user or property..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md border w-full md:w-1/3 dark:bg-gray-700 dark:border-gray-600"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-md border dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-md border dark:bg-gray-700 dark:border-gray-600"
        />

      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center border dark:border-gray-700">
          No matching visit requests found
        </div>
      ) : (

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[600px]">

              <thead className="bg-gray-100 dark:bg-gray-700 text-sm uppercase">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Property</th>
                  <th className="p-4 text-left">Visit Date</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredBookings.map((b) => (

                  <tr key={b._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">

                    <td className="p-4">{b.user?.name || "N/A"}</td>
                    <td className="p-4">{b.property?.title || "N/A"}</td>
                    <td className="p-4">
                      {b.visitDate ? new Date(b.visitDate).toLocaleDateString() : "N/A"}
                    </td>

                    <td className="p-4 text-center">

                      {b.status === "PENDING" ? (

                        <div className="flex flex-col sm:flex-row gap-2 justify-center">

                          <button
                            disabled={updatingId === b._id}
                            onClick={() => updateStatus(b._id, "APPROVED")}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded disabled:opacity-50"
                          >
                            Approve
                          </button>

                          <button
                            disabled={updatingId === b._id}
                            onClick={() => updateStatus(b._id, "REJECTED")}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded disabled:opacity-50"
                          >
                            Reject
                          </button>

                        </div>

                      ) : (

                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(b.status)}`}>
                          {b.status}
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t dark:border-gray-700">

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

export default AgentBookings