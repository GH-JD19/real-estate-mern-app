import { getImageUrl } from "../utils/getImageUrl"
import { MapPin, BedDouble, Bath, Maximize, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import api from "../services/api"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

function PropertyCard({ property, onClick }) {

  const [saved, setSaved] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {

    if (!user) return

    const checkSaved = async () => {

      try {

        const res = await api.get("/wishlist")

        const exists = res.data.properties?.some(
          (p) => p._id === property._id
        )

        setSaved(exists)

      } catch (err) {
        console.log(err)
      }

    }

    checkSaved()

  }, [user, property._id])


  const toggleWishlist = async (e) => {

    e.stopPropagation()

    if (!user) {

      localStorage.setItem("pendingWishlist", property._id)

      toast.info("Please login to save property")

      navigate("/login")

      return
    }

    try {

      if (saved) {

        await api.put(`/wishlist/remove/${property._id}`)

        toast.success("Removed from wishlist")

        setSaved(false)

      } else {

        await api.put(`/wishlist/add/${property._id}`)

        toast.success("Saved to wishlist")

        setSaved(true)

      }

    } catch (err) {

      console.log(err)

      toast.error("Something went wrong")

    }

  }

  const images = property?.media?.images || []

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition duration-300 group"
    >

      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden">

        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="h-full"
        >

          {images.length > 0 ? (

            images.map((img, index) => (

              <SwiperSlide key={index}>

                <img
                  src={getImageUrl(img)}
                  alt={property?.title}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                />

              </SwiperSlide>

            ))

          ) : (

            <SwiperSlide>

              <img
                src="https://via.placeholder.com/400x300?text=No+Image"
                alt="No property"
                className="w-full h-56 object-cover"
              />

            </SwiperSlide>

          )}

        </Swiper>

        {/* PURPOSE BADGE */}
        {property?.purpose && (
          <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md z-10">
            {property.purpose}
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800 backdrop-blur p-2 rounded-full shadow-md hover:scale-110 transition z-10"
        >
          <Heart
            size={18}
            className={
              saved
                ? "text-red-500 fill-red-500"
                : "text-gray-500 dark:text-gray-300"
            }
          />
        </button>

      </div>


      {/* CONTENT */}
      <div className="p-5 space-y-3">

        {/* PRICE */}
        <div className="text-xl font-bold text-blue-600">
          ₹ {property.price?.toLocaleString()}
        </div>

        {/* TITLE */}
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white line-clamp-1">
          {property.title}
        </h3>

        {/* LOCATION */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">

          <MapPin size={16} className="mr-1 text-blue-600" />

          {property.city || property.address || "Location not specified"}

        </div>

        {/* PROPERTY DETAILS */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">

          <span className="flex items-center gap-1">
            <BedDouble size={16} /> {property.bedrooms || 0}
          </span>

          <span className="flex items-center gap-1">
            <Bath size={16} /> {property.bathrooms || 0}
          </span>

          <span className="flex items-center gap-1">
            <Maximize size={16} /> {property.area || 0} sqft
          </span>

        </div>

      </div>

    </div>
  )
}

export default PropertyCard