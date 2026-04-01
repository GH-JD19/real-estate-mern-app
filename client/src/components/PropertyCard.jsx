import { getImageUrl } from "../utils/getImageUrl"
import { MapPin, BedDouble, Bath, Maximize, Heart, ShieldCheck } from "lucide-react"
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

  // 🧠 Calculate posted time
  const getPostedDays = () => {
    if (!property?.createdAt) return null
    const created = new Date(property.createdAt)
    const now = new Date()
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return diff === 0 ? "Today" : `${diff} days ago`
  }

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
      className="cursor-pointer bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
    >

      {/* IMAGE */}
      <div className="relative h-44 sm:h-52 overflow-hidden">

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
                  loading="lazy"
                  className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
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

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

        {/* PURPOSE */}
        {property?.purpose && (
          <span className="absolute top-4 left-4 bg-blue-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg z-10">
            {property.purpose}
          </span>
        )}

        {/* VERIFIED */}
        {property?.isVerified && (
          <span className="absolute top-4 left-28 flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            <ShieldCheck size={14} /> Verified
          </span>
        )}

        {/* WISHLIST */}
        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800 p-2.5 rounded-full shadow-md hover:scale-110 transition z-10"
        >
          <Heart
            size={18}
            className={`transition ${
              saved
                ? "text-red-500 fill-red-500 scale-110"
                : "text-gray-500 dark:text-gray-300"
            }`}
          />
        </button>

        {/* POSTED TIME */}
        {getPostedDays() && (
          <span className="absolute bottom-3 left-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
            {getPostedDays()}
          </span>
        )}

      </div>

      {/* CONTENT */}
      <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">

        {/* PRICE */}
        <div className="text-xl sm:text-2xl font-bold text-blue-600">
          ₹ {property.price?.toLocaleString()}
        </div>

        {/* TITLE */}
        <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white line-clamp-1 group-hover:text-blue-600 transition">
          {property.title}
        </h3>

        {/* LOCATION */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin size={16} className="mr-1 text-blue-600" />
          <span className="line-clamp-1">
            {property.city || property.address || "Location not specified"}
          </span>
        </div>

        {/* DETAILS */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">

          <span className="flex items-center gap-1 hover:text-blue-600 transition">
            <BedDouble size={16} /> {property.bedrooms || 0}
          </span>

          <span className="flex items-center gap-1 hover:text-blue-600 transition">
            <Bath size={16} /> {property.bathrooms || 0}
          </span>

          <span className="flex items-center gap-1 hover:text-blue-600 transition">
            <Maximize size={16} /> {property.area || 0} sqft
          </span>

        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-2.5 rounded-lg font-medium transition"
        >
          View Details
        </button>

      </div>

    </div>
  )
}

export default PropertyCard