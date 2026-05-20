import React, { memo, useMemo, useCallback } from "react"
import { getImageUrl } from "../utils/getImageUrl"
import { MapPin, BedDouble, Bath, Maximize, Heart, ShieldCheck } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

function PropertyCard({ property, onClick }) {
  const { user, wishlist = [], toggleWishlist } = useAuth()
  const navigate = useNavigate()

  // ✅ Safe property fallback
  const safeProperty = property || {}

  // ❤️ Memoized saved state
  const isSaved = useMemo(() => {
    return wishlist.some((p) => p._id === safeProperty._id)
  }, [wishlist, safeProperty._id])

  // 🧠 Memoized posted time
  const postedTime = useMemo(() => {
    if (!safeProperty?.createdAt) return null
    const created = new Date(safeProperty.createdAt)
    const now = new Date()
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return diff === 0 ? "Today" : `${diff} days ago`
  }, [safeProperty?.createdAt])

  // 🖼️ Image handling
  const imageSrc = useMemo(() => {
    return safeProperty?.media?.images?.[0]
      ? getImageUrl(safeProperty.media.images[0])
      : "/no-image.jpg"
  }, [safeProperty])

  // ❤️ Wishlist click
  const handleWishlistClick = useCallback((e) => {
    e.stopPropagation()

    if (!user) {
      toast.info("Please login to save property")
      navigate("/login")
      return
    }

    toggleWishlist(safeProperty._id)
  }, [user, navigate, toggleWishlist, safeProperty._id])

  // 🧠 Card click safe
  const handleCardClick = useCallback(() => {
    if (onClick) onClick()
  }, [onClick])

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`View property ${safeProperty?.title || ""}`}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className="cursor-pointer bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group focus:outline-none"
    >

      {/* IMAGE */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageSrc}
          alt={safeProperty?.title || "Property"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== "/no-image.jpg") {
              e.target.src = "/no-image.jpg"
            }
          }}
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* PURPOSE */}
        {safeProperty?.purpose && (
          <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
            {safeProperty.purpose}
          </span>
        )}

        {/* VERIFIED */}
        {safeProperty?.isVerified && (
          <span className="absolute top-4 left-28 flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            <ShieldCheck size={14} /> Verified
          </span>
        )}

        {/* ❤️ WISHLIST */}
        <button
          onClick={handleWishlistClick}
          aria-label="Toggle wishlist"
          className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:scale-110 transition"
        >
          <Heart
            size={18}
            className={`transition ${
              isSaved
                ? "text-red-500 fill-red-500 scale-110"
                : "text-gray-500 dark:text-gray-300"
            }`}
          />
        </button>

        {/* POSTED TIME */}
        {postedTime && (
          <span className="absolute bottom-3 left-4 text-xs text-white bg-black/50 px-2 py-1 rounded">
            {postedTime}
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">

        {/* PRICE */}
        <div className="text-xl font-bold text-blue-600">
          ₹ {safeProperty?.price ? safeProperty.price.toLocaleString() : "N/A"}
        </div>

        {/* TITLE */}
        <h3 className="font-semibold text-lg text-gray-800 dark:text-white line-clamp-1 group-hover:text-blue-600 transition">
          {safeProperty?.title || "Untitled Property"}
        </h3>

        {/* LOCATION */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin size={16} className="mr-1 text-blue-600" />
          <span className="line-clamp-1">
            {safeProperty?.city || safeProperty?.address || "Location not specified"}
          </span>
        </div>

        {/* DETAILS */}
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-700">

          <span className="flex items-center gap-1">
            <BedDouble size={16} /> {safeProperty?.bedrooms ?? 0}
          </span>

          <span className="flex items-center gap-1">
            <Bath size={16} /> {safeProperty?.bathrooms ?? 0}
          </span>

          <span className="flex items-center gap-1">
            <Maximize size={16} /> {safeProperty?.area ?? 0} sqft
          </span>

        </div>
      </div>
    </article>
  )
}

export default memo(PropertyCard)