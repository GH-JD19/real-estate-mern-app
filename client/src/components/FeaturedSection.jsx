import PropertyCard from "../components/PropertyCard"
import { useNavigate } from "react-router-dom"

function FeaturedSection({ data, loading, error }) {
  const navigate = useNavigate()

  const Skeleton = () => (
    <div className="animate-pulse h-60 bg-gray-300 dark:bg-gray-700 rounded-2xl"></div>
  )

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center dark:text-white">
        Featured Properties
      </h2>

      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : (
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
      )}
    </section>
  )
}

export default FeaturedSection