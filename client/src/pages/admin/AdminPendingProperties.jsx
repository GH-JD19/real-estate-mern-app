import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { io } from "socket.io-client"
import { toast } from "react-toastify"
import { Search } from "lucide-react"

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const AdminPendingProperties = () => {

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
  const fetchPending = async (page = 1, showLoader = false) => {
    try {
      if (showLoader) setLoading(true)

      // cancel previous request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      let url = `/properties/admin/all?status=PENDING&page=${page}&limit=6`

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

    } catch (error) {
      if (error.name !== "CanceledError") {
        toast.error("Failed to load pending properties")
      }
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchPending(1, true)
  }, [])

  // ================= SOCKET (RUN ONCE) =================
  useEffect(() => {

    const newSocket = io(SOCKET_URL, { withCredentials: true })
    socketRef.current = newSocket

    newSocket.emit("joinAdmin")

    const handleUpdate = () => {
      clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(() => {
        fetchPending(pageRef.current, false)
      }, 500)
    }

    newSocket.on("dashboard:update", handleUpdate)

    return () => {
      clearTimeout(debounceRef.current)
      newSocket.off("dashboard:update", handleUpdate)
      newSocket.disconnect()
      abortRef.current?.abort()
    }

  }, [])

  // ================= SEARCH EFFECT =================
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPending(1, true)
      pageRef.current = 1
    }, 400)

    return () => clearTimeout(delay)
  }, [search])

  // ================= PAGE SAFETY =================
  useEffect(() => {
    if (currentPage > totalPages) {
      fetchPending(1)
    }
  }, [totalPages])

  return (
    <div className="min-h-screen p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Pending Property Approvals
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Review and manage property approval requests
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex flex-wrap gap-4 mb-6">

        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow w-full md:w-80">
          <Search size={16} className="mr-2 text-gray-400" />
          <input
            placeholder="Search pending property..."
            className="bg-transparent outline-none text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      {/* CONTENT */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Loading pending properties...
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            🚫 No Pending Properties Found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-gray-100 dark:bg-gray-700 text-sm">
                  <tr>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Owner</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {properties.map(p => (
                    <tr
                      key={p._id}
                      className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="p-4 font-medium">{p.title}</td>
                      <td className="p-4">{p.createdBy?.name || "—"}</td>

                      <td className="p-4 text-center">
                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                          PENDING
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => navigate(`/admin/property/${p._id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition shadow-sm"
                        >
                          View
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2 flex-wrap">

                <button
                  disabled={loading || currentPage === 1}
                  onClick={() => fetchPending(currentPage - 1)}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    disabled={loading}
                    onClick={() => fetchPending(index + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  disabled={loading || currentPage === totalPages}
                  onClick={() => fetchPending(currentPage + 1)}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
                >
                  Next
                </button>

              </div>
            )}

          </>
        )}

      </div>

    </div>
  )
}

export default AdminPendingProperties