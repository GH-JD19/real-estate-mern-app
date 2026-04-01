import PropertyCard from "../components/PropertyCard"
import { useNavigate } from "react-router-dom"

function FeaturedSection({ data, loading, error }) {
  const navigate = useNavigate()

  const Skeleton = () => (
    <div className="animate-pulse h-64 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
  )

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold mb-12 text-center dark:text-white">
        Featured Properties
      </h2>

      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : (
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
      )}
    </section>
  )
}

export default FeaturedSection