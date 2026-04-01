import PropertyCard from "../components/PropertyCard"
import { useNavigate } from "react-router-dom"

function PropertyList({
  data,
  totalPages,
  loading,
  error,
  currentPage,
  onPageChange,
}) {
  const navigate = useNavigate()

  const Skeleton = () => (
    <div className="animate-pulse h-60 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
  )

  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => i + 1
  )

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

      {/* TITLE */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center dark:text-white">
        Available Properties
      </h2>

      {/* ERROR */}
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : loading ? (

        /* LOADING STATE */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>

      ) : (
        <>
          {/* PROPERTY GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.isArray(data) &&
              data.map((p) => (
                <div
                  key={p._id}
                  className="transition-transform duration-300 hover:scale-[1.02]"
                >
                  <PropertyCard
                    property={p}
                    onClick={() => navigate(`/property/${p._id}`)}
                  />
                </div>
              ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mt-10 sm:mt-12">

              {visiblePages.map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                    currentPage === p
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
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