import { useEffect, useState } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"

const AgentRejectedProperties = () => {

  const navigate = useNavigate()

  const [properties, setProperties] = useState([])

  useEffect(() => {
    fetchRejected()
  }, [])

  const fetchRejected = async () => {
    try {

      const res = await api.get("/properties/my?status=REJECTED")

      setProperties(res.data.properties || [])

    } catch (err) {

      toast.error("Failed to load rejected properties")
      setProperties([])
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">
          Rejected Properties
        </h2>

        <button
          onClick={() => navigate("/agent/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg"
        >
          <FaArrowLeft /> Back
        </button>

      </div>

      {properties.length === 0 ? (

        <div className="bg-white dark:bg-gray-800 p-6 text-center rounded shadow">
          No Rejected Properties
        </div>

      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {properties.map(property => (

            <div
              key={property._id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden"
            >

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

                <span className="inline-block mt-4 px-3 py-1 text-white text-sm rounded bg-red-500">
                  REJECTED
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

export default AgentRejectedProperties