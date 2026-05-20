import React, { memo, useMemo, useCallback } from "react"
import PropertyCard from "../components/PropertyCard"
import { useNavigate } from "react-router-dom"

function PropertyList({
  data = [],
  totalPages = 1,
  loading = false,
  error = null,
  currentPage = 1,
  onPageChange = () => {},
}) {
  const navigate = useNavigate()

  // ✅ Memoized skeleton
  const Skeleton = () => (
    <div
      role="status"
      aria-label="Loading property"
      className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl shadow p-4 space-y-4"
    >
      <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-xl" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
    </div>
  )

  // ✅ Memoized visible pages
  const visiblePages = useMemo(() => {
    const pages = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }, [currentPage, totalPages])

  // ✅ Navigation handler
  const handleNavigate = useCallback(
    (id) => {
      if (!id) return
      navigate(`/property/${id}`)
    },
    [navigate]
  )

  // ✅ Pagination handlers
  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || page > totalPages || page === currentPage) return
      onPageChange(page)
    },
    [onPageChange, currentPage, totalPages]
  )

  // ✅ Safe data
  const properties = useMemo(() => {
    return Array.isArray(data) ? data.filter((p) => p?._id) : []
  }, [data])

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
      aria-labelledby="property-list-heading"
    >

      {/* TITLE */}
      <h2
        id="property-list-heading"
        className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center dark:text-white"
      >
        Available Properties
      </h2>

      {/* ERROR */}
      {error && (
        <p className="text-center text-red-500 mb-6">
          {typeof error === "string" ? error : "Something went wrong"}
        </p>
      )}

      {/* LOADING */}
      {loading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          aria-live="polite"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (

        /* EMPTY */
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          No properties available right now
        </div>

      ) : (
        <>
          {/* GRID */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
          >
            {properties.map((p) => (
              <div
                key={p._id}
                role="listitem"
                className="transition-all duration-500 ease-in-out hover:scale-[1.02] opacity-0 animate-fadeIn"
              >
                <PropertyCard
                  property={p}
                  onClick={() => handleNavigate(p._id)}
                />
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div
              className="flex justify-center items-center flex-wrap gap-2 mt-12"
              role="navigation"
              aria-label="Pagination"
            >

              {/* PREV */}
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
              >
                Prev
              </button>

              {/* PAGES */}
              {visiblePages.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  aria-current={currentPage === p ? "page" : undefined}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === p
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}

              {/* NEXT */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>

            </div>
          )}
        </>
      )}
    </section>
  )
}

export default memo(PropertyList)