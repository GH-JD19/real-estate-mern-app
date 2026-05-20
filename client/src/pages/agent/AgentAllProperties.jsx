import { useEffect, useState, useRef } from "react"
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
  const [error, setError] = useState("")

  const abortRef = useRef(null)
  const latestRequest = useRef(0)

  // ================= FETCH =================
  const fetchProperties = async (pageNumber = 1) => {

    // cancel previous request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    const requestId = Date.now()
    latestRequest.current = requestId

    try {
      setLoading(true)
      setError("")

      const res = await api.get(`/properties/my`, {
        params: { page: pageNumber, limit: 6 },
        signal: controller.signal,
        timeout: 10000
      })

      // prevent stale response override
      if (latestRequest.current !== requestId) return

      setProperties(res.data.properties || [])
      setPages(res.data.pages || 1)
      setTotal(res.data.total || 0)

    } catch (err) {

      if (err.name === "CanceledError") return

      if (latestRequest.current !== requestId) return

      toast.error(err?.response?.data?.message || "Failed to load properties")
      setError("Failed to load properties")
      setProperties([])

    } finally {
      if (latestRequest.current === requestId) {
        setLoading(false)
      }
    }
  }

  // ================= EFFECT =================
  useEffect(() => {
    fetchProperties(page)

    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [page])

  // ================= SCROLL =================
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [page])

  // ================= STATUS COLOR =================
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

  // ================= SAFE FORMAT =================
  const formatPrice = (price) => {
    if (!price) return "N/A"
    return `₹ ${Number(price).toLocaleString()}`
  }

  // ================= PAGINATION SAFE RANGE =================
  const getPageNumbers = () => {
    const maxVisible = 5
    let start = Math.max(1, page - 2)
    let end = Math.min(pages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    const range = []
    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    return range
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

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 text-center p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading properties...
        </div>
      ) : properties.length === 0 ? (
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
                onClick={() => navigate(`/agent/property/${property._id}`)}
                className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition rounded-xl overflow-hidden cursor-pointer"
              >

                {/* Image */}
                <div className="relative">
                  <img
                    src={property.media?.images?.[0] || "/no-image.jpg"}
                    alt={property.title}
                    loading="lazy"
                    onError={(e) => (e.target.src = "/no-image.jpg")}
                    className="h-44 sm:h-48 w-full object-cover"
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
                    {formatPrice(property.price)}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {property.city}, {property.state}
                  </p>

                </div>

              </div>

            ))}

          </div>

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

              {getPageNumbers().map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition ${
                    page === p
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {p}
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