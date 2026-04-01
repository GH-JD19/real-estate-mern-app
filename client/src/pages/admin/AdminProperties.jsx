import { useState, useEffect } from "react"
import api from "../../services/api"
import socket from "../../services/socket"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"

const AdminProperties = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchProperties = async (page = 1, showLoader = false) => {

    try {

      if (showLoader) setLoading(true)

      const res = await api.get(
        `/properties/admin/all?page=${page}&limit=6&search=${search}`
      )

      setProperties(res.data?.properties || [])
      setTotalPages(res.data?.totalPages || 1)
      setCurrentPage(page)

    } catch {
      toast.error("Failed to fetch properties")
    } finally {
      if (showLoader) setLoading(false)
    }

  }

  useEffect(() => {

    fetchProperties(1, true)

    if (!socket.connected) {
      socket.connect()
      socket.emit("joinAdmin")
    }

    const handleUpdate = () => {
      fetchProperties(currentPage, false)
    }

    socket.on("dashboard:update", handleUpdate)

    return () => {
      socket.off("dashboard:update", handleUpdate)
    }

  }, [search])

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-500"
      case "PENDING": return "bg-yellow-500"
      case "REJECTED": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">

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

        {/* SEARCH */}
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow w-full md:w-72">
          <Search size={16} className="mr-2 text-gray-400" />
          <input
            placeholder="Search property..."
            className="bg-transparent outline-none text-sm w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
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
                        <button
                          onClick={() => navigate(`/admin/property/${p._id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs md:text-sm"
                        >
                          View
                        </button>
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
            disabled={currentPage === 1}
            onClick={() => fetchProperties(currentPage - 1)}
            className="px-3 py-1 bg-gray-300 rounded text-sm"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {

            const page = index + 1

            return (
              <button
                key={page}
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
            disabled={currentPage === totalPages}
            onClick={() => fetchProperties(currentPage + 1)}
            className="px-3 py-1 bg-gray-300 rounded text-sm"
          >
            Next
          </button>

        </div>

      )}

    </div>
  )
}

export default AdminProperties