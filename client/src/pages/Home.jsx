import { useEffect, useState, lazy, Suspense, useCallback } from "react"
import { Helmet } from "react-helmet-async"
import api from "../services/api"

import HeroSection from "../components/HeroSection"
import FeaturedSection from "../components/FeaturedSection"
import PropertyList from "../components/PropertyList"
import WhyChooseUs from "../components/WhyChooseUs"
import SectionSkeleton from "../components/SectionSkeleton"

// Lazy load
const Testimonials = lazy(() => import("../components/Testimonials"))

function Home() {
  const [featured, setFeatured] = useState([])
  const [properties, setProperties] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)

  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [propertiesLoading, setPropertiesLoading] = useState(true)

  const [featuredError, setFeaturedError] = useState(null)
  const [propertiesError, setPropertiesError] = useState(null)

  // SAFE FETCH HANDLER
  const fetchData = useCallback(
    async (url, setData, setError, setLoading, extra = null) => {
      let isMounted = true

      try {
        setLoading(true)

        const res = await api.get(url)

        const list =
          res.data?.properties ||
          res.data?.data ||
          res.data?.items ||
          []

        if (!isMounted) return

        setData(list)

        if (extra && res.data?.totalPages) {
          extra(res.data.totalPages)
        }

        setError(null)

      } catch (err) {
        if (!isMounted) return

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong"
        )
      } finally {
        if (isMounted) setLoading(false)
      }

      return () => {
        isMounted = false
      }
    },
    []
  )

  const fetchFeatured = useCallback(() => {
    fetchData(
      "/properties/featured",
      setFeatured,
      setFeaturedError,
      setFeaturedLoading
    )
  }, [fetchData])

  const fetchProperties = useCallback(
    (currentPage = 1) => {
      fetchData(
        `/properties?page=${currentPage}`,
        setProperties,
        setPropertiesError,
        setPropertiesLoading,
        setTotalPages
      )
    },
    [fetchData]
  )

  useEffect(() => {
    fetchFeatured()
  }, [fetchFeatured])

  useEffect(() => {
    fetchProperties(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [page, fetchProperties])

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* SEO */}
      <Helmet>
        <title>Find Properties | Buy, Sell, Rent Homes</title>
        <meta
          name="description"
          content="Explore top properties for buy, sell, and rent near you."
        />
      </Helmet>

      {/* HERO */}
      <HeroSection />

      {/* FEATURED */}
      <FeaturedSection
        data={featured}
        loading={featuredLoading}
        error={featuredError}
        onRetry={fetchFeatured}
      />

      {/* WHY CHOOSE US */}
      <WhyChooseUs />

      {/* TESTIMONIALS */}
      <Suspense fallback={<SectionSkeleton height="200px" />}>
        <Testimonials />
      </Suspense>

      {/* PROPERTY LIST */}
      <PropertyList
        data={properties}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        loading={propertiesLoading}
        error={propertiesError}
        onRetry={() => fetchProperties(page)}
      />

    </section>
  )
}

export default Home