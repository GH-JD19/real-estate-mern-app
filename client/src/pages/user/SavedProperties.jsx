import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { getImageUrl } from "../../utils/getImageUrl"
import { toast } from "react-toastify"
import io from "socket.io-client"
import { Download } from "lucide-react"

// Export libs
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const socket = io("http://localhost:5000")

function SavedProperties() {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])

  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const propertiesPerPage = 6

  useEffect(() => {
    fetchWishlist()

    socket.on("wishlistUpdated", () => {
      fetchWishlist()
    })

    return () => {
      socket.off("wishlistUpdated")
    }

  }, [])

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchWishlist = async () => {

    try {
      setLoading(true)

      const res = await api.get("/wishlist")

      setProperties(res.data.properties || [])
      setFilteredProperties(res.data.properties || [])

    } catch (err) {
      console.log(err)
      toast.error("Failed to load wishlist")
      setProperties([])
      setFilteredProperties([])
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // FILTER
  // ===============================
  useEffect(() => {

    let temp = [...properties]

    if (search) {
      temp = temp.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredProperties(temp)
    setCurrentPage(1)

  }, [search, properties])

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
  // REMOVE
  // ===============================
  const removeWishlist = async (id) => {

    try {

      await api.put(`/wishlist/remove/${id}`)

      setProperties(prev =>
        prev.filter(property => property._id !== id)
      )

      toast.success("Removed from wishlist")

    } catch (err) {
      console.log(err)
      toast.error("Failed to remove property")
    }
  }

  // ===============================
  // EXPORT
  // ===============================
  const formatData = () => {
    return filteredProperties.map(p => ({
      Title: p.title,
      Price: p.price,
      City: p.city
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
    a.download = "saved_properties.csv"
    a.click()
  }

  const exportExcel = () => {
    const data = formatData()
    if (data.length === 0) return

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Wishlist")
    XLSX.writeFile(wb, "saved_properties.xlsx")
  }

  const exportPDF = () => {
    const data = formatData()
    if (data.length === 0) return

    const doc = new jsPDF()

    const tableData = data.map(item => [
      item.Title,
      item.Price,
      item.City
    ])

    autoTable(doc, {
      head: [["Title", "Price", "City"]],
      body: tableData
    })

    doc.save("saved_properties.pdf")
  }

  return (

    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

        <h2 className="text-2xl md:text-3xl font-bold">
          Saved Properties
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

        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-6">

        <input
          type="text"
          placeholder="Search saved properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 outline-none"
        />

      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : filteredProperties.length === 0 ? (

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-10 text-center">

          <h3 className="text-lg font-semibold mb-2">
            No saved properties
          </h3>

          <p className="text-gray-500 mb-4">
            Browse properties and save the ones you like.
          </p>

          <button
            onClick={() => navigate("/properties")}
            className="bg-[#000080] text-white px-6 py-2 rounded"
          >
            Browse Properties
          </button>

        </div>

      ) : (

        <>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {currentProperties.map(p => (

              <div
                key={p._id}
                className="bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden hover:shadow-xl transition"
              >

                <img
                  src={getImageUrl(p.media?.images?.[0])}
                  alt={p.title}
                  className="h-48 w-full object-cover"
                />

                <div className="p-4 space-y-2">

                  <h3 className="font-semibold text-lg">
                    {p.title}
                  </h3>

                  <p className="text-blue-600 font-bold">
                    ₹ {p.price?.toLocaleString()}
                  </p>

                  <p className="text-gray-600">
                    {p.city}
                  </p>

                  <div className="flex gap-2 mt-3">

                    <button
                      onClick={() => navigate(`/property/${p._id}`)}
                      className="flex-1 bg-[#000080] text-white py-2 rounded"
                    >
                      View
                    </button>

                    <button
                      onClick={() => removeWishlist(p._id)}
                      className="flex-1 border border-red-500 text-red-500 py-2 rounded hover:bg-red-50"
                    >
                      Remove
                    </button>

                  </div>

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

export default SavedProperties