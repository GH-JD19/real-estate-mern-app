import { getImageUrl } from "../utils/getImageUrl"
import { MapPin, BedDouble, Bath, Maximize, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import api from "../services/api"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

function PropertyCard({ property, onClick }) {

  const [saved, setSaved] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()

  // Check if property already in wishlist
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

    // User not logged in
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



  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
    >

      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden">

        <img
          src={getImageUrl(property?.media?.images?.[0])}
          alt={property?.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
        />

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-80"></div>

        {/* PURPOSE */}
        {property?.purpose && (
          <span className="absolute top-4 left-4 bg-[#000080] text-white text-xs px-3 py-1 rounded-full shadow-lg tracking-wide">
            {property.purpose}
          </span>
        )}

        {/* WISHLIST */}
        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800 p-2 rounded-full shadow hover:scale-110 transition"
        >
          <Heart
            size={18}
            className={saved ? "text-red-500 fill-red-500" : "text-gray-500"}
          />
        </button>

        {/* PRICE */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-1 rounded-xl shadow text-[#000080] font-bold text-sm">
          ₹ {property.price?.toLocaleString()}
        </div>

      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-3">

        <h3 className="font-semibold text-lg text-gray-800 dark:text-white line-clamp-1 group-hover:text-[#000080] transition">
          {property.title}
        </h3>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin size={16} className="mr-1 text-[#000080]" />
          {property.city || property.address || "Location not specified"}
        </div>

        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-700">

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