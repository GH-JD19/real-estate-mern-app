import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import { toast } from "react-toastify"

const AdminPendingProperties = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPending = async (page = 1) => {
    try {
      setLoading(true)

      // 🔥 Build URL safely (avoid empty search param)
      let url = `/properties/admin/all?status=PENDING&page=${page}&limit=6`

      if (search.trim() !== "") {
        url += `&search=${encodeURIComponent(search.trim())}`
      }

      const res = await api.get(url)

      setProperties(res.data.properties || [])
      setTotalPages(res.data.totalPages || 1)
      setCurrentPage(page)

    } catch (error) {
      toast.error("Failed to load pending properties")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending(1)
  }, [search])

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6 text-gray-900 dark:text-white">

      <h2 className="text-2xl font-bold mb-4">
        Pending Property Approvals
      </h2>

      <input
        placeholder="Search pending property..."
        className="border p-2 mb-4 rounded w-full dark:bg-gray-800"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setCurrentPage(1) // reset page when searching
        }}
      />

      {loading ? (
        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded shadow">
          Loading...
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded shadow">
          No Pending Properties
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
              {properties.map(p => (
                <tr key={p._id} className="border-t dark:border-gray-700">
                  <td className="p-4">{p.title}</td>
                  <td className="p-4">{p.createdBy?.name}</td>
                  <td className="p-4 text-center">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                      PENDING
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
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2 flex-wrap">

              <button
                disabled={currentPage === 1}
                onClick={() => fetchPending(currentPage - 1)}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
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
                disabled={currentPage === totalPages}
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
  )
}

export default AdminPendingProperties