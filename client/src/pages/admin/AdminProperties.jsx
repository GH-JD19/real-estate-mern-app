import { useState, useEffect } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const AdminProperties = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProperties = async (page = 1) => {

    try {

      const res = await api.get(
        `/properties/admin/all?page=${page}&limit=6&search=${search}`
      )

      setProperties(res.data?.properties || [])
      setTotalPages(res.data?.totalPages || 1)
      setCurrentPage(page)

    } catch {

      toast.error("Failed to fetch properties")

    }

  }

  useEffect(() => {

    const loadProperties = async () => {
      await fetchProperties(1)
    }

    loadProperties()

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

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 text-gray-900 dark:text-white">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">

        <div>
          <h1 className="text-2xl font-bold">
            Manage Properties
          </h1>
          <p className="text-gray-500 text-sm">
            View and manage all listed properties
          </p>
        </div>

        <input
          placeholder="Search property..."
          className="border rounded px-3 py-2 w-full sm:w-72 dark:bg-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">

        <div className="overflow-x-auto">

          <table className="min-w-full text-sm">

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

                  <tr
                    key={p._id}
                    className="border-t dark:border-gray-700"
                  >

                    <td className="p-4 font-medium">
                      {p.title}
                    </td>

                    <td className="p-4">
                      {p.createdBy?.name || "Unknown"}
                    </td>

                    <td className="p-4 text-center">

                      <span
                        className={`text-white px-3 py-1 rounded text-xs ${getStatusBadge(p.status)}`}
                      >
                        {p.status}
                      </span>

                    </td>

                    <td className="p-4 text-center">

                      <button
                        onClick={() => navigate(`/admin/property/${p._id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
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

      </div>

      {/* Pagination */}
      {totalPages > 1 && (

        <div className="flex flex-wrap justify-center mt-6 gap-2">

          <button
            disabled={currentPage === 1}
            onClick={() => fetchProperties(currentPage - 1)}
            className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {

            const page = index + 1

            return (

              <button
                key={page}
                onClick={() => fetchProperties(page)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                {page}
              </button>

            )

          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => fetchProperties(currentPage + 1)}
            className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      )}

    </div>

  )

}

export default AdminProperties