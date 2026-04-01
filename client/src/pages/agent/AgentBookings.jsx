import { useEffect, useState } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { io } from "socket.io-client"
import { Download } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const AgentBookings = () => {

  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])

  const [loading, setLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("")

  // Pagination (SERVER SIDE ✅)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // ================= FETCH =================
  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true)

      const res = await api.get(`/visits/agent?page=${page}&limit=5`)

      setBookings(res.data.visits || [])
      setCurrentPage(res.data.currentPage)
      setTotalPages(res.data.totalPages)

    } catch (err) {
      console.log("Agent bookings fetch error", err)
      toast.error("Failed to fetch bookings")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings(currentPage)
  }, [currentPage])

  // ================= SOCKET.IO =================
  useEffect(() => {
    const socket = io("http://localhost:5000")

    socket.emit("joinAgent")

    socket.on("visitUpdated", () => {
      fetchBookings(currentPage)
    })

    return () => socket.disconnect()
  }, [currentPage])

  // ================= UPDATE =================
  const updateStatus = async (id, status) => {

    if (!window.confirm("Are you sure?")) return

    try {

      await api.patch(`/visits/${id}`, { status })

      toast.success(`Visit ${status.toLowerCase()} successfully`)

      // no manual fetch needed (socket handles it)

    } catch (err) {

      console.log("Status update failed", err)
      toast.error("Status update failed")

    }

  }

  // ================= FILTER =================
  const applyFilters = () => {

    let data = [...bookings]

    if (search) {
      data = data.filter(b =>
        b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.property?.title?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter !== "ALL") {
      data = data.filter(b => b.status === statusFilter)
    }

    if (dateFilter) {
      data = data.filter(b =>
        new Date(b.visitDate).toDateString() === new Date(dateFilter).toDateString()
      )
    }

    setFilteredBookings(data)

  }

  useEffect(() => {
    applyFilters()
  }, [search, statusFilter, dateFilter, bookings])

  // ================= CSV EXPORT =================
  const exportCSV = () => {

    const data = filteredBookings.map(b => ({
      User: b.user?.name,
      Property: b.property?.title,
      Date: new Date(b.visitDate).toLocaleDateString(),
      Status: b.status
    }))

    const csv = Papa.unparse(data)

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "visits.csv"
    a.click()
  }

  // ================= EXCEL EXPORT =================
  const exportExcel = () => {

    const data = filteredBookings.map(b => ({
      User: b.user?.name,
      Property: b.property?.title,
      Date: new Date(b.visitDate).toLocaleDateString(),
      Status: b.status
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Visits")

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    })

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    })

    saveAs(blob, "visits.xlsx")
  }

  // ================= PDF EXPORT =================
  const exportPDF = () => {

    const doc = new jsPDF()

    const tableColumn = ["User", "Property", "Date", "Status"]

    const tableRows = filteredBookings.map(b => ([
      b.user?.name,
      b.property?.title,
      new Date(b.visitDate).toLocaleDateString(),
      b.status
    ]))

    doc.text("Visit Requests", 14, 15)

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20
    })

    doc.save("visits.pdf")
  }

  // ================= STATUS UI =================
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

          <button
            onClick={exportCSV}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Download size={16}/> CSV
          </button>

          <button
            onClick={exportExcel}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            <Download size={16}/> Excel
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg"
          >
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

                    <td className="p-4">{b.user?.name}</td>

                    <td className="p-4">{b.property?.title}</td>

                    <td className="p-4">
                      {new Date(b.visitDate).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-center">

                      {b.status === "PENDING" ? (

                        <div className="flex flex-col sm:flex-row gap-2 justify-center">

                          <button
                            onClick={() => updateStatus(b._id, "APPROVED")}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => updateStatus(b._id, "REJECTED")}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded"
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