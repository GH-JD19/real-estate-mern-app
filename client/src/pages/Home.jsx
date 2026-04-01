import { useEffect, useState, lazy, Suspense, useCallback } from "react"
import { Helmet } from "react-helmet-async"
import api from "../services/api"

import HeroSection from "../components/HeroSection"
import FeaturedSection from "../components/FeaturedSection"
import PropertyList from "../components/PropertyList"
import WhyChooseUs from "../components/WhyChooseUs"
import SectionSkeleton from "../components/SectionSkeleton"

// Lazy load heavy components
const Testimonials = lazy(() => import("../components/Testimonials"))

function Home() {
  // DATA STATES
  const [featured, setFeatured] = useState([])
  const [properties, setProperties] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)

  // LOADING STATES (SEPARATED)
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [propertiesLoading, setPropertiesLoading] = useState(true)

  // ERROR STATES (SEPARATED)
  const [featuredError, setFeaturedError] = useState(null)
  const [propertiesError, setPropertiesError] = useState(null)

  // ==============================
  // FETCH FEATURED PROPERTIES
  // ==============================
  const fetchFeatured = useCallback(async () => {
    try {
      setFeaturedLoading(true)

      const res = await api.get(`/properties/featured`)

      if (process.env.NODE_ENV === "development") {
        console.log("FEATURED:", res.data)
      }

      setFeatured(res.data.properties || [])
      setFeaturedError(null)
    } catch (err) {
      console.error(err)
      setFeaturedError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load featured properties"
      )
    } finally {
      setFeaturedLoading(false)
    }
  }, [])

  // ==============================
  // FETCH PAGINATED PROPERTIES
  // ==============================
  const fetchProperties = useCallback(async (currentPage = 1) => {
    try {
      setPropertiesLoading(true)

      const res = await api.get(`/properties?page=${currentPage}`)

      if (process.env.NODE_ENV === "development") {
        console.log("PROPERTIES:", res.data)
      }

      setProperties(res.data.properties || [])
      setTotalPages(res.data.totalPages || 1)
      setPropertiesError(null)
    } catch (err) {
      console.error(err)
      setPropertiesError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load properties"
      )
    } finally {
      setPropertiesLoading(false)
    }
  }, [])

  // ==============================
  // EFFECT: LOAD FEATURED ONCE
  // ==============================
  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (isMounted) await fetchFeatured()
    }

    load()

    return () => {
      isMounted = false
    }
  }, [fetchFeatured])

  // ==============================
  // EFFECT: LOAD PROPERTIES ON PAGE CHANGE
  // ==============================
  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (isMounted) await fetchProperties(page)
    }

    load()

    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" })

    return () => {
      isMounted = false
    }
  }, [page, fetchProperties])

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">

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

      {/* TESTIMONIALS (LAZY) */}
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
    </div>
  )
}

export default Home