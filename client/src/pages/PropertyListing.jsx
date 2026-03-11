import { useEffect, useState } from "react"
import api from "../services/api"
import PropertyCard from "../components/PropertyCard"

function PropertyListing() {

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await api.get("/properties")
        setProperties(data?.properties || [])
      } catch (err) {
        setError("Failed to load properties")
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  return (
    <div className="bg-[#f9fafb] min-h-screen py-14">

      <div className="max-w-7xl mx-auto px-6">

        {/* 🔹 Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">
            Available Properties
          </h2>
          <p className="text-gray-500">
            Explore verified homes & investment opportunities
          </p>
        </div>

        {/* 🔹 Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-500 text-lg">
            Loading properties...
          </div>
        )}

        {/* 🔹 Error */}
        {!loading && error && (
          <div className="text-center py-20 text-red-500">
            {error}
          </div>
        )}

        {/* 🔹 Empty */}
        {!loading && !error && properties.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-600">
              No Properties Available
            </h3>
            <p className="text-gray-400 mt-2">
              Please check back later for new listings
            </p>
          </div>
        )}

        {/* 🔹 Grid */}
        {!loading && !error && properties.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <div
                key={property._id}
                className="transition transform hover:-translate-y-2 hover:shadow-2xl"
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Footer spacing */}
      <div className="pb-20"></div>

    </div>
  )
}

export default PropertyListing