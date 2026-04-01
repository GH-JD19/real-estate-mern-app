import { useEffect, useState } from "react"
import api from "../../services/api"
import io from "socket.io-client"
import { Download } from "lucide-react"

// Export libs
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const socket = io("http://localhost:5000")

function MyBookings() {

  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])

  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [date, setDate] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const bookingsPerPage = 5

  useEffect(() => {
    fetchBookings()

    socket.on("bookingUpdated", () => {
      fetchBookings()
    })

    return () => {
      socket.off("bookingUpdated")
    }

  }, [])

  // ===============================
  // FETCH BOOKINGS
  // ===============================
  const fetchBookings = async () => {
    try {
      setLoading(true)

      const res = await api.get("/visits/user")

      setBookings(res.data.visits || [])
      setFilteredBookings(res.data.visits || [])

    } catch (err) {
      console.log(err)
      setBookings([])
      setFilteredBookings([])
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // FILTER LOGIC
  // ===============================
  useEffect(() => {

    let temp = [...bookings]

    // 🔍 SEARCH
    if (search) {
      temp = temp.filter(b =>
        b.property?.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.property?.city?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 📅 DATE FILTER
    if (date) {
      temp = temp.filter(b => {
        if (!b.visitDate) return false
        const visit = new Date(b.visitDate).toISOString().split("T")[0]
        return visit === date
      })
    }

    setFilteredBookings(temp)
    setCurrentPage(1)

  }, [search, date, bookings])

  // ===============================
  // PAGINATION LOGIC
  // ===============================
  const indexOfLast = currentPage * bookingsPerPage
  const indexOfFirst = indexOfLast - bookingsPerPage
  const currentBookings = filteredBookings.slice(indexOfFirst, indexOfLast)

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage)

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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
    return filteredBookings.map(b => ({
      Property: b.property?.title,
      City: b.property?.city,
      Price: b.property?.price,
      VisitDate: new Date(b.visitDate).toLocaleString(),
      Status: b.status
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
    a.download = "my_bookings.csv"
    a.click()
  }

  const exportExcel = () => {
    const data = formatData()
    if (data.length === 0) return

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Bookings")
    XLSX.writeFile(wb, "my_bookings.xlsx")
  }

  const exportPDF = () => {
    const data = formatData()
    if (data.length === 0) return

    const doc = new jsPDF()

    const tableData = data.map(item => [
      item.Property,
      item.City,
      item.Price,
      item.VisitDate,
      item.Status
    ])

    autoTable(doc, {
      head: [["Property", "City", "Price", "Visit Date", "Status"]],
      body: tableData
    })

    doc.save("my_bookings.pdf")
  }

  return (

    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

        <h2 className="text-2xl md:text-3xl font-bold">
          My Visits
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
      ) : filteredBookings.length === 0 ? (

        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded shadow">
          No visits found
        </div>

      ) : (

        <>
          <div className="space-y-4">

            {currentBookings.map(b => (

              <div
                key={b._id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >

                <div className="flex-1">

                  <h3 className="font-semibold text-lg">
                    {b.property?.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300">
                    {b.property?.city}
                  </p>

                  <p className="text-blue-600 font-bold">
                    ₹ {b.property?.price?.toLocaleString()}
                  </p>

                  <p className="mt-2 text-sm">
                    Visit Date:
                    <span className="ml-2 font-medium">
                      {new Date(b.visitDate).toLocaleString()}
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

export default MyBookings