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
    <div className="bg-gray-50 dark:bg-gray-900">

      {/* HERO SECTION */}
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4000 }}
        pagination={{ clickable: true }}
        loop
        className="w-full h-[560px]"
      >

        {[slide1, slide2, slide3].map((img, index) => (

          <SwiperSlide key={index}>

            <div
              className="w-full h-[560px] bg-cover bg-center relative flex items-center justify-center"
              style={{ backgroundImage: `url(${img})` }}
            >

              <div className="absolute inset-0 bg-black/60"></div>

              <div className="relative z-10 text-center text-white px-6 max-w-4xl">

                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Find Your Dream Home
                </h1>

                <p className="text-lg md:text-xl mb-8 text-gray-200">
                  Buy, Sell and Rent Properties Easily
                </p>

                {/* SEARCH BAR */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    navigate(`/properties?location=${location}`)
                  }}
                  className="grid md:grid-cols-5 gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl"
                >

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                    className="border p-3 rounded-lg outline-none text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                  />

                  <select className="border p-3 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900">
                    <option value="">Purpose</option>
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                    <option value="sell">Sell</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Min Price"
                    className="border p-3 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                  />

                  <input
                    type="number"
                    placeholder="Max Price"
                    className="border p-3 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
                  />

                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition px-4"
                  >
                    Search
                  </button>

                </form>

              </div>

            </div>

          </SwiperSlide>

        ))}

      </Swiper>

      {/* FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-white">
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

      {/* WHY CHOOSE US */}
      <section className="bg-white dark:bg-gray-800 dark:bg-gray-800 py-20">

        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold mb-14 text-gray-800 dark:text-white">
            Why Choose Us
          </h2>

          <div className="grid gap-10 md:grid-cols-3">

            <div className="p-8 rounded-xl shadow hover:shadow-xl transition bg-gray-50 dark:bg-gray-900">

              <h3 className="font-semibold text-xl mb-3">
                Trusted Agents
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                Professional and verified real estate agents.
              </p>

            </div>

            <div className="p-8 rounded-xl shadow hover:shadow-xl transition bg-gray-50 dark:bg-gray-900">

              <h3 className="font-semibold text-xl mb-3">
                Secure Transactions
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                Safe and transparent property dealings.
              </p>

            </div>

            <div className="p-8 rounded-xl shadow hover:shadow-xl transition bg-gray-50 dark:bg-gray-900">

              <h3 className="font-semibold text-xl mb-3">
                Wide Listings
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                Hundreds of verified properties available.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">

        <h2 className="text-3xl font-bold mb-14 text-gray-800 dark:text-white">
          What Our Clients Say
        </h2>

        <div className="grid gap-8 md:grid-cols-3">

          {[
            {
              name: "Rahul Sharma",
              text: "Amazing service and smooth buying experience."
            },
            {
              name: "Priya Verma",
              text: "Best platform to find rental properties."
            },
            {
              name: "Amit Singh",
              text: "Highly recommended for real estate investment."
            }
          ].map((review, i) => (

            <div
              key={i}
              className="bg-white dark:bg-gray-800 shadow-lg p-8 rounded-xl hover:shadow-xl transition"
            >

              <p className="text-yellow-500 text-lg mb-3">★★★★★</p>

              <p className="text-gray-600 dark:text-gray-300">
                {review.text}
              </p>

              <h4 className="mt-4 font-semibold">
                {review.name}
              </h4>

            </div>

          ))}

        </div>

      </section>

      {/* AVAILABLE PROPERTIES */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-white">
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

              <div className="flex justify-center items-center gap-4 mt-12">

                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  Prev
                </button>

                <span className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
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