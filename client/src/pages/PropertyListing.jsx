import { useEffect, useState } from "react"
import api from "../services/api"
import PropertyCard from "../components/PropertyCard"
import { Search } from "lucide-react"

function PropertyListing() {

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

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

  const filteredProperties = properties.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-24">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Explore Properties
          </h1>
          <p className="text-gray-500 text-lg">
            Find your perfect home or investment opportunity
          </p>
        </div>

        {/* SEARCH */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex items-center bg-white dark:bg-gray-800 border rounded-2xl px-5 py-4 shadow-md">
            <Search size={20} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search by property name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-300 text-lg"
            />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-32">
            <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="text-center py-24 text-red-500 text-lg">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredProperties.length === 0 && (
          <div className="text-center py-28">
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
              No Properties Found
            </h3>
            <p className="text-gray-500 mt-3">
              Try a different keyword
            </p>
          </div>
        )}

        {/* GRID */}
        {!loading && !error && filteredProperties.length > 0 && (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
              />
            ))}
          </div>
        )}

      </div>

      <div className="pb-24"></div>

    </div>
  )
}

export default PropertyListing