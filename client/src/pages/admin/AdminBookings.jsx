import { useEffect, useState, useMemo } from "react"
import api from "../../services/api"
import socket from "../../services/socket"

import { toast } from "react-toastify"
import { CheckCircle, XCircle, Search, Eye, Download } from "lucide-react"

import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function AdminBookings() {

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [sortOrder, setSortOrder] = useState("LATEST")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  // 🚀 FETCH
  const fetchBookings = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true)

      const res = await api.get("/visits/admin")
      setBookings(res.data.visits || [])

    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load bookings")
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  // 🚀 REAL-TIME SOCKET
  useEffect(() => {

    fetchBookings(true)

    if (!socket.connected) {
      socket.connect()
      socket.emit("joinAdmin")
    }

    const handleUpdate = () => {
      console.log("Realtime booking update")
      fetchBookings(false)
    }

    socket.on("dashboard:update", handleUpdate)

    return () => {
      socket.off("dashboard:update", handleUpdate)
    }

  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/visits/${id}`, { status })
      toast.success(`Booking ${status}`)
      fetchBookings(false)
      setConfirmModal(null)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update booking")
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/90"
      case "REJECTED":
        return "bg-red-500/90"
      default:
        return "bg-yellow-500/90"
    }
  }

  // 🔍 FILTER
  const filteredBookings = useMemo(() => {
    let data = [...bookings]

    if (search) {
      data = data.filter(b =>
        b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.property?.title?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (filterStatus !== "ALL") {
      data = data.filter(b => b.status === filterStatus)
    }

    data.sort((a, b) => {
      const dateA = new Date(a.visitDate)
      const dateB = new Date(b.visitDate)
      return sortOrder === "LATEST" ? dateB - dateA : dateA - dateB
    })

    return data
  }, [bookings, search, filterStatus, sortOrder])

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterStatus])

  // 📤 EXPORT FORMAT
  const formatData = () => filteredBookings.map(b => ({
    Property: b.property?.title,
    User: b.user?.name,
    Email: b.user?.email,
    Date: new Date(b.visitDate).toLocaleString(),
    Status: b.status
  }))

  const exportCSV = () => {
    const data = formatData()
    if (!data.length) return

    const headers = Object.keys(data[0]).join(",")
    const rows = data.map(row => Object.values(row).join(",")).join("\n")
    const csv = headers + "\n" + rows

    const blob = new Blob([csv])
    saveAs(blob, "bookings.csv")
  }

  const exportExcel = () => {
    const data = formatData()
    if (!data.length) return

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Bookings")

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buffer]), "bookings.xlsx")
  }

  const exportPDF = () => {
    const data = formatData()
    if (!data.length) return

    const doc = new jsPDF()
    doc.text("Bookings Report", 14, 15)

    autoTable(doc, {
      startY: 20,
      head: [Object.keys(data[0])],
      body: data.map(row => Object.values(row))
    })

    doc.save("bookings.pdf")
  }

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Bookings Dashboard</h2>
        <p className="text-gray-500">Manage and track all bookings</p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3 mb-6">

        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow">
          <Search size={16} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow text-sm">
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
          className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow text-sm">
          <option value="LATEST">Latest</option>
          <option value="OLDEST">Oldest</option>
        </select>

        <button onClick={exportCSV} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1">
          <Download size={16}/> CSV
        </button>

        <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-1">
          <Download size={16}/> Excel
        </button>

        <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-1">
          <Download size={16}/> PDF
        </button>

      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : paginatedBookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow text-center">
          No bookings found
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBookings.map(b => (
              <div key={b._id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-xl transition">

                <h3 className="font-semibold text-lg mb-2">{b.property?.title}</h3>

                <p><strong>User:</strong> {b.user?.name}</p>
                <p className="truncate"><strong>Email:</strong> {b.user?.email}</p>
                <p><strong>Date:</strong> {new Date(b.visitDate).toLocaleString()}</p>

                <div className="mt-3">
                  <span className={`text-white px-3 py-1 rounded-full text-xs ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                <div className="flex gap-2 mt-4 flex-wrap">

                  <button onClick={() => setSelectedBooking(b)} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
                    <Eye size={16}/> View
                  </button>

                  {b.status === "PENDING" && (
                    <>
                      <button onClick={() => setConfirmModal({ id: b._id, status: "APPROVED" })}
                        className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1">
                        <CheckCircle size={16}/> Approve
                      </button>

                      <button onClick={() => setConfirmModal({ id: b._id, status: "REJECTED" })}
                        className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1">
                        <XCircle size={16}/> Reject
                      </button>
                    </>
                  )}

                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* MODALS (UNCHANGED) */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="font-bold mb-2">Details</h3>
            <p>{selectedBooking.property?.title}</p>
            <button onClick={() => setSelectedBooking(null)}>Close</button>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center">
            <p>Confirm {confirmModal.status}?</p>
            <button onClick={() => updateStatus(confirmModal.id, confirmModal.status)}>Yes</button>
            <button onClick={() => setConfirmModal(null)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminBookings