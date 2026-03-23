import { useEffect, useState } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"

const MyListings = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])

  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    fetchListings(page)
  }, [page])

  const fetchListings = async (pageNumber = 1) => {
    try {

      const res = await api.get(`/properties/agent?page=${pageNumber}&limit=6`)

      setProperties(res.data.properties)
      setPages(res.data.pages)
      setPage(res.data.page)

    } catch (err) {
      toast.error("Failed to load listings")
      setProperties([])
    }
  }

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

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Listings</h2>

        <button
          onClick={() => navigate("/agent/manage-properties")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          <FaArrowLeft />
          Back
        </button>
      </div>

      {properties.length === 0 ? (
        
        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded shadow">
          No Properties Found
        </div>
      ) : (

        <>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {properties.map(property => (

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

                <span
                  className={`inline-block mt-4 px-3 py-1 text-white text-sm rounded ${statusColor(property.status)}`}
                >
                  {property.status}
                </span>

              </div>

            </div>

          ))}

        </div>

        {/* PAGINATION */}

        {pages > 1 && (

          <div className="flex justify-center items-center mt-8 gap-2 flex-wrap">

            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(pages).keys()].map(x => (

              <button
                key={x + 1}
                onClick={() => setPage(x + 1)}
                className={`px-4 py-2 rounded ${
                  page === x + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {x + 1}
              </button>

            ))}

            <button
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
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

export default MyListings