import { useEffect, useState } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import { Download } from "lucide-react"
import io from "socket.io-client"

// Export libs
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const socket = io("http://localhost:5000")

const AgentRejectedProperties = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])

  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Filters
  const [search, setSearch] = useState("")
  const [date, setDate] = useState("")

  const propertiesPerPage = 6

  useEffect(() => {
    fetchRejected()

    socket.on("propertyUpdated", () => {
      fetchRejected()
    })

    return () => {
      socket.off("propertyUpdated")
    }

  }, [])

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchRejected = async () => {
    try {
      setLoading(true)

      const res = await api.get("/properties/my?status=REJECTED")

      setProperties(res.data.properties || [])
      setFilteredProperties(res.data.properties || [])

    } catch (err) {
      toast.error("Failed to load rejected properties")
      setProperties([])
      setFilteredProperties([])
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // FILTER LOGIC
  // ===============================
  useEffect(() => {

    let temp = [...properties]

    // 🔍 SEARCH
    if (search) {
      temp = temp.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase()) ||
        p.state?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 📅 DATE
    if (date) {
      temp = temp.filter(p => {
        if (!p.createdAt) return false
        const propertyDate = new Date(p.createdAt).toISOString().split("T")[0]
        return propertyDate === date
      })
    }

    setFilteredProperties(temp)
    setCurrentPage(1)

  }, [search, date, properties])

  // ===============================
  // PAGINATION
  // ===============================
  const indexOfLast = currentPage * propertiesPerPage
  const indexOfFirst = indexOfLast - propertiesPerPage
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast)

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ===============================
  // EXPORT
  // ===============================
  const formatData = () => {
    return filteredProperties.map(p => ({
      Title: p.title,
      Price: p.price,
      City: p.city,
      State: p.state,
      Status: "Rejected"
    }))
  }

  const exportCSV = () => {
    const data = formatData()
    if (data.length === 0) return

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "rejected_properties.csv"
    a.click()
  }

  const exportExcel = () => {
    const data = formatData()
    if (data.length === 0) return

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Rejected")
    XLSX.writeFile(wb, "rejected_properties.xlsx")
  }

  const exportPDF = () => {
    const data = formatData()
    if (data.length === 0) return

    const doc = new jsPDF()

    const tableData = data.map(item => [
      item.Title,
      item.Price,
      item.City,
      item.State,
      item.Status
    ])

    autoTable(doc, {
      head: [["Title", "Price", "City", "State", "Status"]],
      body: tableData
    })

    doc.save("rejected_properties.pdf")
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

        <h2 className="text-2xl md:text-3xl font-bold">
          Rejected Properties
        </h2>

        <div className="flex flex-wrap gap-2">

          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg">
            <Download size={16}/> CSV
          </button>

          <button onClick={exportExcel} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg">
            <Download size={16}/> Excel
          </button>

          <button onClick={exportPDF} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg">
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

      {/* FILTER BAR */}
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
                  className="h-48 w-full object-cover"
                />

                <div className="p-4 space-y-2">

                  <h3 className="font-semibold text-lg">
                    {property.title}
                  </h3>

                  <p className="text-blue-600 font-bold">
                    ₹ {property.price?.toLocaleString()}
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

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {i + 1}
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