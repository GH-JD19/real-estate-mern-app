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

    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-20">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-10">

          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Available Properties
          </h1>

          <p className="text-gray-500 dark:text-gray-400">
            Explore verified homes & investment opportunities
          </p>

        </div>


        {/* SEARCH BAR */}
        <div className="max-w-xl mx-auto mb-14">

          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm">

            <Search size={18} className="text-gray-400 mr-3" />

            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-300"
            />

          </div>

        </div>


        {/* LOADING */}
        {loading && (

          <div className="flex justify-center py-24">

            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

          </div>

        )}


        {/* ERROR */}
        {!loading && error && (

          <div className="text-center py-20 text-red-500 font-medium">

            {error}

          </div>

        )}


        {/* EMPTY */}
        {!loading && !error && filteredProperties.length === 0 && (

          <div className="text-center py-24">

            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              No Properties Found
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Try searching with a different keyword
            </p>

          </div>

        )}


        {/* PROPERTY GRID */}
        {!loading && !error && filteredProperties.length > 0 && (

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProperties.map((property) => (

              <PropertyCard
                key={property._id}
                property={property}
              />

            ))}

          </div>

        )}

      </div>

      {/* FOOTER SPACING */}
      <div className="pb-20"></div>

    </div>

  )

}

export default PropertyListing