import { useEffect, useState } from "react"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import { toast } from "react-toastify"

function AgentPendingProperties() {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const propertiesPerPage = 6

  useEffect(() => {
    fetchPendingProperties()
  }, [])

  // ===============================
  // FETCH PENDING PROPERTIES
  // ===============================
  const fetchPendingProperties = async () => {
    try {

      const res = await api.get("/properties/my?status=PENDING")

      setProperties(res.data.properties || [])

    } catch (err) {

      toast.error("Failed to load pending properties")
      setProperties([])

    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // PAGINATION LOGIC
  // ===============================
  const indexOfLast = currentPage * propertiesPerPage
  const indexOfFirst = indexOfLast - propertiesPerPage
  const currentProperties = properties.slice(indexOfFirst, indexOfLast)

  const totalPages = Math.ceil(properties.length / propertiesPerPage)

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Pending Approval Properties
        </h2>

        <button
          onClick={() => navigate("/agent/manage-properties")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          <FaArrowLeft />
          Back
        </button>

      </div>

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
          {/* Property Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {currentProperties.map((property) => (

              <div
                key={property._id}
                className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden hover:shadow-xl transition duration-300"
              >

                {/* Property Image */}
                <img
                  src={property.media?.images?.[0] || "/no-image.jpg"}
                  alt={property.title}
                  className="h-48 w-full object-cover"
                />

                <div className="p-4">

                  <h3 className="font-semibold text-lg mb-1">
                    {property.title}
                  </h3>

                  <p className="text-blue-600 font-bold text-lg">
                    ₹ {property.price?.toLocaleString()}
                  </p>

                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                    {property.city}, {property.state}
                  </p>

                  {/* Status */}
                  <span className="inline-block mt-4 px-3 py-1 text-white text-sm rounded bg-yellow-500">
                    Pending Approval
                  </span>

                </div>

              </div>

            ))}

          </div>

          {/* Pagination */}
          {totalPages > 1 && (

            <div className="flex justify-center items-center mt-8 gap-2 flex-wrap">

              <button
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => (

                <button
                  key={index}
                  onClick={() => goToPage(index + 1)}
                  className={`px-4 py-2 rounded ${
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
                onClick={() => goToPage(currentPage + 1)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
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

export default AgentPendingProperties