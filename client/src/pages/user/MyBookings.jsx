import { useEffect, useState, useRef } from "react"
import api from "../../services/api"
import { io } from "socket.io-client"
import { Download } from "lucide-react"

import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://real-estate-mern-app-98vu.onrender.com"

function MyBookings() {

  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [date, setDate] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  const bookingsPerPage = 5

  const socketRef = useRef(null)
  const abortRef = useRef(null)
  const latestRequest = useRef(0)

  // ================= SOCKET =================
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true })
    socketRef.current = socket

    const userId = JSON.parse(localStorage.getItem("user"))?._id
    if (userId) socket.emit("joinUser", userId)

    socket.on("bookingUpdated", () => {
      fetchBookings()
    })

    return () => {
      socket.off("bookingUpdated")
      socket.disconnect()
    }
  }, [])

  // ================= FETCH =================
  const fetchBookings = async () => {

    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    const requestId = Date.now()
    latestRequest.current = requestId

    try {
      setLoading(true)
      setError("")

      const res = await api.get("/visits/user", {
        signal: controller.signal,
        timeout: 10000
      })

      if (latestRequest.current !== requestId) return

      const data = res.data.visits || []

      setBookings(data)
      setFilteredBookings(data)

    } catch (err) {
      if (err.name === "CanceledError") return
      if (latestRequest.current !== requestId) return

      setError("Failed to load visits")
      setBookings([])
      setFilteredBookings([])

    } finally {
      if (latestRequest.current === requestId) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // ================= FILTER =================
  useEffect(() => {

    let temp = [...bookings]

    if (search) {
      temp = temp.filter(b =>
        b.property?.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.property?.city?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (date) {
      temp = temp.filter(b => {
        if (!b.visitDate) return false
        const visit = new Date(b.visitDate)
        if (isNaN(visit)) return false
        return visit.toISOString().split("T")[0] === date
      })
    }

    setFilteredBookings(temp)
    setCurrentPage(1)

  }, [search, date, bookings])

  // ================= PAGINATION =================
  const indexOfLast = currentPage * bookingsPerPage
  const indexOfFirst = indexOfLast - bookingsPerPage
  const currentBookings = filteredBookings.slice(indexOfFirst, indexOfLast)

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage)

  const getPageNumbers = () => {
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    const range = []
    for (let i = start; i <= end; i++) range.push(i)
    return range
  }

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ================= STATUS =================
  const statusColor = (status) => {
    switch(status) {
      case "APPROVED": return "bg-green-500"
      case "PENDING": return "bg-yellow-500"
      case "REJECTED": return "bg-red-500"
      default: return "bg-gray-400"
    }
  }

  // ================= EXPORT =================
  const formatData = () =>
    filteredBookings.map(b => ({
      Property: b.property?.title || "N/A",
      City: b.property?.city || "N/A",
      Price: b.property?.price || "N/A",
      VisitDate: b.visitDate
        ? new Date(b.visitDate).toLocaleString()
        : "N/A",
      Status: b.status
    }))

  const handleExport = async (type) => {
    setExporting(true)

    const data = formatData()
    if (!data.length) {
      setExporting(false)
      return
    }

    if (type === "csv") {
      const csv = [
        Object.keys(data[0]).join(","),
        ...data.map(row => Object.values(row).join(","))
      ].join("\n")

      const blob = new Blob([csv])
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "my_bookings.csv"
      a.click()
    }

    if (type === "excel") {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Bookings")
      XLSX.writeFile(wb, "my_bookings.xlsx")
    }

    if (type === "pdf") {
      const doc = new jsPDF()
      autoTable(doc, {
        head: [["Property", "City", "Price", "Visit Date", "Status"]],
        body: data.map(item => Object.values(item))
      })
      doc.save("my_bookings.pdf")
    }

    setExporting(false)
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 text-center p-3 mb-4 rounded">
          {error}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

        <h2 className="text-2xl md:text-3xl font-bold">
          My Visits
        </h2>

        <div className="flex flex-wrap gap-2">

          <button onClick={() => handleExport("csv")}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
            <Download size={16}/> CSV
          </button>

          <button onClick={() => handleExport("excel")}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
            <Download size={16}/> Excel
          </button>

          <button onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">
            <Download size={16}/> PDF
          </button>

        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4">

        <input
          type="text"
          placeholder="Search property, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 outline-none"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700"
        />

        <button
          onClick={() => {
            setSearch("")
            setDate("")
          }}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear
        </button>

      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded shadow">
          No visits found
        </div>
      ) : (
        <>
          <div className="space-y-4">

            {currentBookings.map(b => (
              <div key={b._id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                <div className="flex-1">

                  <h3 className="font-semibold text-lg">
                    {b.property?.title || "N/A"}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300">
                    {b.property?.city || "N/A"}
                  </p>

                  <p className="text-blue-600 font-bold">
                    ₹ {b.property?.price ? Number(b.property.price).toLocaleString() : "N/A"}
                  </p>

                  <p className="mt-2 text-sm">
                    Visit Date:
                    <span className="ml-2 font-medium">
                      {b.visitDate ? new Date(b.visitDate).toLocaleString() : "N/A"}
                    </span>
                  </p>

                </div>

                <div>
                  <span className={`px-4 py-2 text-white text-sm rounded ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>

              </div>
            ))}

          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 flex-wrap gap-2">

              <button disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">
                Prev
              </button>

              {getPageNumbers().map(p => (
                <button key={p}
                  onClick={() => goToPage(p)}
                  className={`px-4 py-2 rounded ${
                    currentPage === p
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}>
                  {p}
                </button>
              ))}

              <button disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">
                Next
              </button>

            </div>
          )}
        </>
      )}

    </div>
  )
}

export default MyBookings