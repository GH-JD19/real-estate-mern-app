import { useEffect, useState, useRef } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import { Download } from "lucide-react"
import { io } from "socket.io-client"

import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AgentRejectedProperties = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [search, setSearch] = useState("")
  const [date, setDate] = useState("")
  const [exporting, setExporting] = useState(false)

  const propertiesPerPage = 6

  const socketRef = useRef(null)
  const abortRef = useRef(null)
  const latestRequest = useRef(0)
  const debounceRef = useRef(null)

  // ================= SOCKET =================
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true })
    socketRef.current = socket

    socket.emit("joinAgent")

    socket.on("propertyUpdated", () => {
      fetchRejected()
    })

    return () => {
      socket.off("propertyUpdated")
      socket.disconnect()
    }
  }, [])

  // ================= FETCH =================
  const fetchRejected = async (searchVal = search) => {

    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    const requestId = Date.now()
    latestRequest.current = requestId

    try {
      setLoading(true)
      setError("")

      const res = await api.get(`/properties/my`, {
        params: {
          status: "REJECTED",
          search: searchVal,
          date
        },
        signal: controller.signal,
        timeout: 10000
      })

      if (latestRequest.current !== requestId) return

      const data = res.data.properties || []

      setProperties(data)
      setFilteredProperties(data)
      setCurrentPage(1)

    } catch (err) {
      if (err.name === "CanceledError") return
      if (latestRequest.current !== requestId) return

      toast.error(err?.response?.data?.message || "Failed to load rejected properties")
      setError("Failed to load rejected properties")
      setProperties([])
      setFilteredProperties([])

    } finally {
      if (latestRequest.current === requestId) {
        setLoading(false)
      }
    }
  }

  // ================= DEBOUNCE =================
  useEffect(() => {
    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchRejected()
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [search, date])

  // ================= PAGINATION =================
  const indexOfLast = currentPage * propertiesPerPage
  const indexOfFirst = indexOfLast - propertiesPerPage
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast)

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)

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

  // ================= EXPORT =================
  const fetchAllData = async () => {
    try {
      const res = await api.get(`/properties/my`, {
        params: {
          status: "REJECTED",
          search,
          date,
          limit: 1000
        }
      })
      return res.data.properties || []
    } catch {
      toast.error("Export failed")
      return []
    }
  }

  const formatData = (data) =>
    data.map(p => ({
      Title: p.title || "N/A",
      Price: p.price || "N/A",
      City: p.city || "N/A",
      State: p.state || "N/A",
      Status: "Rejected"
    }))

  const handleExport = async (type) => {
    setExporting(true)

    const data = formatData(await fetchAllData())
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
      a.download = "rejected_properties.csv"
      a.click()
    }

    if (type === "excel") {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Rejected")
      XLSX.writeFile(wb, "rejected_properties.xlsx")
    }

    if (type === "pdf") {
      const doc = new jsPDF()
      autoTable(doc, {
        head: [["Title", "Price", "City", "State", "Status"]],
        body: data.map(item => Object.values(item))
      })
      doc.save("rejected_properties.pdf")
    }

    setExporting(false)
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {error && (
        <div className="bg-red-100 text-red-600 text-center p-3 mb-4 rounded">
          {error}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

        <h2 className="text-2xl md:text-3xl font-bold">
          Rejected Properties
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

          <button
            onClick={() => navigate("/agent/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg"
          >
            <FaArrowLeft /> Back
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
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded shadow">
          No Matching Rejected Properties
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {currentProperties.map(property => (

              <div
                key={property._id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden hover:shadow-xl transition"
              >

                <img
                  src={property.media?.images?.[0] || "/no-image.jpg"}
                  alt={property.title}
                  loading="lazy"
                  onError={(e) => (e.target.src = "/no-image.jpg")}
                  className="h-44 sm:h-48 w-full object-cover"
                />

                <div className="p-4 space-y-2">

                  <h3 className="font-semibold text-lg">
                    {property.title}
                  </h3>

                  <p className="text-blue-600 font-bold">
                    ₹ {property.price ? Number(property.price).toLocaleString() : "N/A"}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {property.city}, {property.state}
                  </p>

                  <span className="inline-block px-3 py-1 text-white text-xs rounded bg-red-500">
                    REJECTED
                  </span>

                </div>

              </div>

            ))}

          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 flex-wrap gap-2">

              <button
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
              >
                Prev
              </button>

              {getPageNumbers().map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-4 py-2 rounded ${
                    currentPage === p
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
              >
                Next
              </button>

            </div>
          )}
        </>
      )}

    </div>
  )
}

export default AgentRejectedProperties