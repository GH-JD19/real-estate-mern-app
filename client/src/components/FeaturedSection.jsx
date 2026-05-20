import React, { memo, useMemo, useCallback } from "react"
import PropertyCard from "../components/PropertyCard"
import { useNavigate } from "react-router-dom"

function FeaturedSection({ data = [], loading = false, error = null }) {
  const navigate = useNavigate()

  // Memoized navigation handler
  const handleNavigate = useCallback(
    (id) => {
      if (!id) return
      navigate(`/property/${id}`)
    },
    [navigate]
  )

  // Memoized skeleton loader
  const skeletonItems = useMemo(() => Array.from({ length: 6 }), [])

  // Memoized property list
  const properties = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.filter((p) => p && p._id)
  }, [data])

  const Skeleton = memo(() => (
    <div
      role="status"
      aria-label="Loading property"
      className="animate-pulse h-60 rounded-2xl bg-gray-200 dark:bg-gray-700"
    />
  ))

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
      aria-labelledby="featured-properties-heading"
    >
      {/* Heading */}
      <h2
        id="featured-properties-heading"
        className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center dark:text-white"
      >
        Featured Properties
      </h2>

      {/* Error State */}
      {error ? (
        <div className="text-center space-y-2">
          <p className="text-red-500 font-medium">
            Something went wrong while loading properties.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {typeof error === "string" ? error : "Please try again later."}
          </p>
        </div>
      ) : loading ? (
        /* Loading State */
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          aria-live="polite"
        >
          {skeletonItems.map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        /* Empty State */
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No featured properties available right now.
          </p>
        </div>
      ) : (
        /* Success State */
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          role="list"
        >
          {properties.map((p) => (
            <div
              key={p._id}
              role="listitem"
              className="transition-transform duration-300 ease-in-out hover:scale-[1.02] focus-within:scale-[1.02]"
            >
              <PropertyCard
                property={p}
                onClick={() => handleNavigate(p._id)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// Prevent unnecessary re-renders
export default memo(FeaturedSection)