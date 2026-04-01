import { useState } from "react"
import PropertyCard from "../components/PropertyCard"
import { useNavigate } from "react-router-dom"

function PropertyList({ data, totalPages, loading, error }) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const Skeleton = () => (
    <div className="animate-pulse h-64 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
  )

  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => i + 1
  )

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold mb-12 text-center dark:text-white">
        Available Properties
      </h2>

      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <div key={p._id} className="hover:scale-105 transition">
                <PropertyCard
                  property={p}
                  onClick={() => navigate(`/property/${p._id}`)}
                />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-12">
              {visiblePages.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default PropertyList