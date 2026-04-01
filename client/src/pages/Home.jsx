import { useEffect, useState, lazy, Suspense } from "react"
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
  const [featured, setFeatured] = useState([])
  const [properties, setProperties] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch function
  const fetchHome = async (currentPage = 1) => {
    try {
      setLoading(true)

      const { data } = await api.get(`/home-data?page=${currentPage}`)

      setFeatured(data?.featured || [])
      setProperties(data?.properties || [])
      setTotalPages(data?.totalPages || 1)

      setError(null)
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.message || "Failed to load homepage data"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHome(page)
  }, [page])

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

      <HeroSection />

      <FeaturedSection
        data={featured}
        loading={loading}
        error={error}
        onRetry={() => fetchHome(page)}
      />

      <WhyChooseUs />

      {/* Lazy Loaded Testimonials */}
      <Suspense fallback={<SectionSkeleton height="200px" />}>
        <Testimonials />
      </Suspense>

      <PropertyList
        data={properties}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        loading={loading}
        error={error}
        onRetry={() => fetchHome(page)}
      />
    </div>
  )
}

export default Home