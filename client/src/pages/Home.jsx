import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

import slide1 from "../assets/slider/slide1.jpg"
import slide2 from "../assets/slider/slide2.jpg"
import slide3 from "../assets/slider/slide3.jpg"

import api from "../services/api"
import PropertyCard from "../components/PropertyCard"
import { useNavigate } from "react-router-dom"

function Home() {
  const [featured, setFeatured] = useState([])
  const [properties, setProperties] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    fetchFeatured()
    fetchProperties(page)
  }, [page])

  const fetchFeatured = async () => {
    try {
      const { data } = await api.get("/properties/featured")
      setFeatured(data?.properties || [])
    } catch {
      setFeatured([])
    }
  }

  const fetchProperties = async (pageNum) => {
    try {
      const { data } = await api.get(`/properties?page=${pageNum}`)
      setProperties(data?.properties || [])
      setTotalPages(data?.totalPages || 1)
    } catch {
      setProperties([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#f9fafb]">

      {/* 🔥 HERO SLIDER */}
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        loop
        className="w-full h-[520px]"
      >
        {[slide1, slide2, slide3].map((img, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full h-[520px] bg-cover bg-center relative"
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 🔎 HERO SEARCH BAR */}
      <section className="w-full bg-white dark:bg-gray-800 py-10 shadow-sm">
        <div className="container mx-auto px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              navigate("/properties")
            }}
            className="grid gap-4 md:grid-cols-5 items-center bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border"
          >
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value.toUpperCase())}
              placeholder="Location"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080]"
            />

            <select
              name="type"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080]"
            >
              <option value="">Purpose</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
              <option value="sell">Sell</option>
            </select>

            <input
              type="number"
              placeholder="Min Price"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080]"
            />

            <input
              type="number"
              placeholder="Max Price"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080]"
            />

            <button
              type="submit"
              className="bg-[#000080] text-white p-3 rounded-lg font-semibold hover:bg-blue-900 transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ⭐ FEATURED */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800 dark:text-gray-200">
          Featured Properties
        </h2>

        {featured.length === 0 ? (
          <p className="text-center text-gray-500">
            No featured properties available.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onClick={() => navigate(`/property/${property._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 💎 WHY CHOOSE US */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-800 dark:text-gray-200">
            Why Choose Us
          </h2>

          <div className="grid gap-10 md:grid-cols-3">
            <div className="p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-2">
                Trusted Agents
              </h3>
              <p className="text-gray-600">
                Professional and verified real estate agents.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-2">
                Secure Transactions
              </h3>
              <p className="text-gray-600">
                Safe and transparent property dealings.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-xl mb-2">
                Wide Listings
              </h3>
              <p className="text-gray-600">
                Hundreds of verified properties available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🗣 TESTIMONIALS */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-12 text-gray-800 dark:text-gray-200">
          What Our Clients Say
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl hover:shadow-xl transition">
            <p className="text-yellow-500 text-lg mb-3">★★★★★</p>
            <p className="text-gray-600">Amazing service and smooth buying experience.</p>
            <h4 className="mt-3 font-semibold">Rahul Sharma</h4>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl hover:shadow-xl transition">
            <p className="text-yellow-500 text-lg mb-3">★★★★★</p>
            <p className="text-gray-600">Best platform to find rental properties.</p>
            <h4 className="mt-3 font-semibold">Priya Verma</h4>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl hover:shadow-xl transition">
            <p className="text-yellow-500 text-lg mb-3">★★★★★</p>
            <p className="text-gray-600">Highly recommended for real estate investment.</p>
            <h4 className="mt-3 font-semibold">Amit Singh</h4>
          </div>
        </div>
      </section>

      {/* 🏠 AVAILABLE */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800 dark:text-gray-200">
          Available Properties
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">
            Loading properties...
          </p>
        ) : properties.length === 0 ? (
          <p className="text-center text-gray-500">
            No properties available.
          </p>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onClick={() => navigate(`/property/${property._id}`)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-5 py-2 bg-[#000080] text-white rounded-lg disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="px-4 py-2 font-medium">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-5 py-2 bg-[#000080] text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

    </div>
  )
}

export default Home