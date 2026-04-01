import { useEffect, useState } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"

const AgentAllProperties = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [page])

  const fetchProperties = async () => {
    try {
      setLoading(true)

      const res = await api.get(`/properties/my?page=${page}&limit=6`)

      setProperties(res.data.properties || [])
      setPages(res.data.pages || 1)
      setTotal(res.data.total || 0)

    } catch (err) {
      toast.error("Failed to load properties")
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (status) => {
    switch (status) {
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

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 sm:px-6 lg:px-10 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          All Properties
          <span className="ml-2 text-blue-600">({total})</span>
        </h2>

        <button
          onClick={() => navigate("/agent/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition rounded-lg text-sm font-medium"
        >
          <FaArrowLeft />
          Back
        </button>

      </div>

      {/* Empty State */}
      {!loading && properties.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded-xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-300">
            No Properties Found
          </p>
        </div>
      ) : (

        <>
          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {properties.map(property => (

              <div
                key={property._id}
                className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition rounded-xl overflow-hidden"
              >

                {/* Image */}
                <div className="relative">
                  <img
                    src={property.media?.images?.[0] || "/no-image.jpg"}
                    alt={property.title}
                    className="h-44 sm:h-48 w-full object-cover"
                    onError={(e) => e.target.src = "/no-image.jpg"}
                  />

                  <span
                    className={`absolute top-3 right-3 px-3 py-1 text-xs text-white rounded-full ${statusColor(property.status)}`}
                  >
                    {property.status}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">

                  <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white line-clamp-1">
                    {property.title}
                  </h3>

                  <p className="text-blue-600 font-bold text-lg">
                    ₹ {property.price?.toLocaleString()}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {property.city}, {property.state}
                  </p>

                </div>

              </div>

            ))}

          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center mt-6 text-gray-500">
              Loading properties...
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-2 flex-wrap">

              <button
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
                className="px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition rounded-md disabled:opacity-50 text-sm"
              >
                Prev
              </button>

              {[...Array(pages).keys()].map(x => (
                <button
                  key={x + 1}
                  onClick={() => setPage(x + 1)}
                  className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition ${
                    page === x + 1
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {x + 1}
                </button>
              ))}

              <button
                disabled={page === pages}
                onClick={() => setPage(prev => prev + 1)}
                className="px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition rounded-md disabled:opacity-50 text-sm"
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

export default AgentAllProperties