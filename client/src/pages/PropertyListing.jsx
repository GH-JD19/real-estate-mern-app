import { useEffect, useState } from "react"
import api from "../services/api"
import PropertyList from "../components/PropertyList"
import { Search } from "lucide-react"

function PropertyListing() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Fetch
  useEffect(() => {
    let isMounted = true

    const fetchProperties = async () => {
      try {
        if (isMounted) {
          setLoading(true)
          setError("")
        }

        const { data } = await api.get(
          `/properties?page=${page}&limit=8&search=${debouncedSearch}`
        )

        if (!isMounted) return

        setProperties(data?.properties || [])
        setTotalPages(data?.pages || 1)

      } catch {
        if (isMounted) setError("Failed to load properties")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProperties()

    return () => {
      isMounted = false
    }
  }, [page, debouncedSearch])

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen py-16">

      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Explore Properties
          </h1>
          <p className="text-gray-500 text-lg">
            Find your perfect home or investment opportunity
          </p>
        </header>

        {/* SEARCH */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center bg-white dark:bg-gray-800 border rounded-2xl px-5 py-4 shadow-md focus-within:ring-2 focus-within:ring-blue-600">
            <Search size={20} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search by property name..."
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              aria-label="Search properties"
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
        {!loading && !error && properties.length === 0 && (
          <div className="text-center py-28">
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
              No Properties Found
            </h3>
            <p className="text-gray-500 mt-3">
              Try a different keyword
            </p>
          </div>
        )}

        {/* LIST */}
        {!loading && !error && properties.length > 0 && (
          <PropertyList
            data={properties}
            loading={loading}
            error={error}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

      </div>

      {/* Bottom spacing */}
      <div className="pb-24" />

    </section>
  )
}

export default PropertyListing