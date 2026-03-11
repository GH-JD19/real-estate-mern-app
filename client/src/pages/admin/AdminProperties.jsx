import { useState, useEffect } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const AdminProperties = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProperties = async (page = 1) => {
    try {
      setLoading(true)

      const res = await api.get(
        `/properties/admin/all?page=${page}&limit=6&search=${search}`
      )

      setProperties(res.data.properties || [])
      setTotalPages(res.data.totalPages || 1)
      setCurrentPage(page)

    } catch {
      toast.error("Failed to fetch properties")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties(1)
  }, [search])

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500"
      case "PENDING":
        return "bg-yellow-500"
      case "REJECTED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6 text-gray-900 dark:text-white">

      <h2 className="text-2xl font-bold mb-4">Manage Properties</h2>

      <input
        placeholder="Search property..."
        className="border p-2 mb-4 rounded w-full dark:bg-gray-800"
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded shadow">
          Loading...
        </div>
      ) : (
        <>
          <table className="w-full bg-white dark:bg-gray-800 rounded shadow">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Owner</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No properties available
                  </td>
                </tr>
              ) : (
                properties.map(p => (
                  <tr key={p._id} className="border-t dark:border-gray-700">
                    <td className="p-4">{p.title}</td>

                    <td className="p-4">
                      {p.createdBy?.name || "Unknown"}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`text-white px-3 py-1 rounded text-sm ${getStatusBadge(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => navigate(`/admin/property/${p._id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchProperties(currentPage - 1)}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => fetchProperties(index + 1)}
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
                disabled={currentPage === totalPages}
                onClick={() => fetchProperties(currentPage + 1)}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
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

export default AdminProperties