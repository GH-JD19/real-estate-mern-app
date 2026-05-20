import { useState, useEffect, useRef } from "react"
import api from "../../services/api"
import { io } from "socket.io-client"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AdminProperties = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const socketRef = useRef(null)
  const debounceRef = useRef(null)
  const pageRef = useRef(1)
  const abortRef = useRef(null)

  // ================= FETCH =================
  const fetchProperties = async (page = 1, showLoader = false) => {
    try {
      if (showLoader) setLoading(true)

      abortRef.current?.abort()
      abortRef.current = new AbortController()

      let url = `/properties/admin/all?page=${page}&limit=6`

      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`
      }

      const res = await api.get(url, {
        signal: abortRef.current.signal
      })

      const props = Array.isArray(res.data?.properties) ? res.data.properties : []
      const total = Number(res.data?.totalPages) || 1

      setProperties(props)
      setTotalPages(total)
      setCurrentPage(page)
      pageRef.current = page

    } catch (err) {
      if (err.name !== "CanceledError") {
        toast.error("Failed to fetch properties")
      }
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  // ================= INITIAL =================
  useEffect(() => {
    fetchProperties(1, true)
  }, [])

  // ================= SOCKET =================
  useEffect(() => {

    const socket = io(SOCKET_URL, { withCredentials: true })
    socketRef.current = socket

    socket.emit("joinAdmin")

    const handleUpdate = () => {
      clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(() => {
        fetchProperties(pageRef.current, false)
      }, 500)
    }

    socket.on("dashboard:update", handleUpdate)

    return () => {
      clearTimeout(debounceRef.current)
      socket.off("dashboard:update", handleUpdate)
      socket.disconnect()
      abortRef.current?.abort()
    }

  }, [])

  // ================= SEARCH =================
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProperties(1, true)
      pageRef.current = 1
    }, 400)

    return () => clearTimeout(delay)
  }, [search])

  // ================= PAGE SAFETY =================
  useEffect(() => {
    if (currentPage > totalPages) {
      fetchProperties(1)
    }
  }, [totalPages])

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-500"
      case "PENDING": return "bg-yellow-500"
      case "REJECTED": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  return (

    <div className="min-h-screen p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Manage Properties
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all listed properties
          </p>
        </div>

        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow w-full md:w-72">
          <Search size={16} className="mr-2 text-gray-400" />
          <input
            placeholder="Search property..."
            className="bg-transparent outline-none text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-2 md:p-4">

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Loading properties...
          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full text-xs md:text-sm">

              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left hidden sm:table-cell">Owner</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>

                {properties.length === 0 ? (

                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-500">
                      🚫 No properties available
                    </td>
                  </tr>

                ) : (

                  properties.map(p => (

                    <tr key={p._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition">

                      <td className="p-3 font-medium">
                        <div className="flex flex-col">
                          {p.title}
                          <span className="text-xs text-gray-400 sm:hidden">
                            {p.createdBy?.name || "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 hidden sm:table-cell">
                        {p.createdBy?.name || "Unknown"}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`text-white px-2 py-1 rounded-full text-xs ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() => navigate(`/admin/property/${p._id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs md:text-sm"
                          >
                            View
                          </button>

                          {/* ✅ EDIT BUTTON WITH STATUS CONTROL */}
                          <button
                            disabled={p.status !== "APPROVED"}
                            onClick={() => navigate(`/admin/edit-property/${p._id}`)}
                            className={`px-3 py-1 rounded text-xs md:text-sm text-white ${
                              p.status === "APPROVED"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Edit
                          </button>

                        </div>
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (

        <div className="flex flex-wrap justify-center mt-6 gap-2">

          <button
            disabled={loading || currentPage === 1}
            onClick={() => fetchProperties(currentPage - 1)}
            className="px-3 py-1 bg-gray-300 rounded text-sm disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1

            return (
              <button
                key={page}
                disabled={loading}
                onClick={() => fetchProperties(page)}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300"
                }`}
              >
                {page}
              </button>
            )
          })}

          <button
            disabled={loading || currentPage === totalPages}
            onClick={() => fetchProperties(currentPage + 1)}
            className="px-3 py-1 bg-gray-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>

        </div>

      )}

    </div>
  )
}

export default AdminProperties