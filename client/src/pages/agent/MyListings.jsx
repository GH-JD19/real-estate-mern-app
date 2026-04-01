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

const MyListings = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])

  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    fetchListings(page)

    socket.on("propertyUpdated", () => {
      fetchListings(page)
    })

    return () => {
      socket.off("propertyUpdated")
    }

  }, [page])

  // ===============================
  // FETCH LISTINGS
  // ===============================
  const fetchListings = async (pageNumber = 1) => {
    try {
      setLoading(true)

      const res = await api.get(`/properties/agent?page=${pageNumber}&limit=6`)

      setProperties(res.data.properties || [])
      setFilteredProperties(res.data.properties || [])
      setPages(res.data.pages || 1)
      setPage(res.data.page || 1)

    } catch (err) {
      toast.error("Failed to load listings")
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

  }, [search, date, properties])

  // ===============================
  // STATUS COLOR
  // ===============================
  const statusColor = (status) => {
    switch(status) {
      case "APPROVED":
        return "bg-green-500"
      case "PENDING":
        return "bg-yellow-500"
      case "REJECTED":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
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
      Status: p.status
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
    a.download = "my_listings.csv"
    a.click()
  }

  const exportExcel = () => {
    const data = formatData()
    if (data.length === 0) return

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Listings")
    XLSX.writeFile(wb, "my_listings.xlsx")
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

    doc.save("my_listings.pdf")
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

        <h2 className="text-2xl md:text-3xl font-bold">
          My Listings
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
            onClick={() => navigate("/agent/manage-properties")}
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
          No Properties Found
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredProperties.map(property => (

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

                  <span className={`inline-block px-3 py-1 text-white text-xs rounded ${statusColor(property.status)}`}>
                    {property.status}
                  </span>

                </div>

              </div>

            ))}

          </div>

          {/* PAGINATION */}
          {pages > 1 && (
            <div className="flex justify-center mt-8 flex-wrap gap-2">

              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
              >
                Prev
              </button>

              {[...Array(pages).keys()].map(x => (
                <button
                  key={x + 1}
                  onClick={() => setPage(x + 1)}
                  className={`px-4 py-2 rounded ${
                    page === x + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {x + 1}
                </button>
              ))}

              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
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

export default MyListings