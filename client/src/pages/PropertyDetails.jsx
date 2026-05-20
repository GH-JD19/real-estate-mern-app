import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

import { Heart, BedDouble, Bath, Maximize, MapPin } from "lucide-react"
import { getImageUrl } from "../utils/getImageUrl"
import { toast } from "react-toastify"

function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, wishlist, toggleWishlist } = useAuth()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeImage, setActiveImage] = useState(0)

  const [message, setMessage] = useState("")
  const [phone, setPhone] = useState("")
  const [visitDate, setVisitDate] = useState("")

  const [actionLoading, setActionLoading] = useState({
    inquiry: false,
    visit: false,
    wishlist: false
  })

  const abortRef = useRef(null)

  // ================= FETCH =================
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        abortRef.current?.abort()
        abortRef.current = new AbortController()

        const res = await api.get(`/properties/${id}`, {
          signal: abortRef.current.signal
        })

        const prop = res.data?.property || null
        setProperty(prop)
        setActiveImage(0)

      } catch (err) {
        if (err.name !== "CanceledError") {
          setError("Failed to load property")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()

    return () => {
      abortRef.current?.abort()
    }
  }, [id])

  const isSaved = wishlist?.some((p) => p?._id === property?._id)

  // ================= WISHLIST =================
  const handleWishlist = useCallback(async () => {
    if (!user) {
      toast.info("Please login first")
      navigate("/login")
      return
    }

    if (!property?._id) return

    try {
      setActionLoading(prev => ({ ...prev, wishlist: true }))
      await toggleWishlist(property._id)
    } catch {
      toast.error("Failed to update wishlist")
    } finally {
      setActionLoading(prev => ({ ...prev, wishlist: false }))
    }
  }, [user, property, toggleWishlist, navigate])

  // ================= INQUIRY =================
  const handleInquiry = useCallback(async () => {
    if (!phone || phone.length < 8) {
      return toast.error("Enter valid phone number")
    }

    if (!message.trim()) {
      return toast.error("Message cannot be empty")
    }

    try {
      setActionLoading(prev => ({ ...prev, inquiry: true }))

      // API CALL (if exists)
      // await api.post("/inquiries", { propertyId: id, phone, message })

      toast.success("Inquiry sent successfully")
      setMessage("")
      setPhone("")
    } catch {
      toast.error("Failed to send inquiry")
    } finally {
      setActionLoading(prev => ({ ...prev, inquiry: false }))
    }
  }, [phone, message, id])

  // ================= VISIT =================
  const handleVisit = useCallback(async () => {
    if (!visitDate) {
      return toast.error("Please select date & time")
    }

    if (new Date(visitDate) < new Date()) {
      return toast.error("Select a future date")
    }

    try {
      setActionLoading(prev => ({ ...prev, visit: true }))

      // API CALL (if exists)
      // await api.post("/visits", { propertyId: id, visitDate })

      toast.success("Visit booked successfully")
      setVisitDate("")
    } catch {
      toast.error("Failed to book visit")
    } finally {
      setActionLoading(prev => ({ ...prev, visit: false }))
    }
  }, [visitDate, id])

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-32 text-red-500 text-lg">
        {error}
      </div>
    )
  }

  if (!property) {
    return (
      <div className="text-center py-32 text-gray-500 text-lg">
        Property not found
      </div>
    )
  }

  const images = property?.media?.images?.length
    ? property.media.images
    : [null]

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">

      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* IMAGE */}
          <div>
            <img
              src={getImageUrl(images[activeImage]) || "/no-image.jpg"}
              alt="property"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "/no-image.jpg")}
              className="w-full h-[420px] object-cover rounded-2xl"
            />

            <div className="flex gap-3 mt-4 overflow-x-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={getImageUrl(img) || "/no-image.jpg"}
                  loading="lazy"
                  onClick={() => setActiveImage(i)}
                  className={`w-24 h-20 object-cover rounded-lg cursor-pointer ${
                    activeImage === i ? "ring-2 ring-blue-600" : "opacity-70"
                  }`}
                  alt={`preview-${i}`}
                />
              ))}
            </div>
          </div>

          {/* TITLE */}
          <div>
            <h1 className="text-3xl font-bold dark:text-white">
              {property.title}
            </h1>

            <p className="flex items-center text-gray-500 mt-2">
              <MapPin size={16} className="mr-1" />
              {property.city || "Location"}
            </p>
          </div>

          {/* INFO */}
          <div className="grid grid-cols-3 gap-4">
            <Info icon={<BedDouble />} label={`${property.bedrooms || 0} Beds`} />
            <Info icon={<Bath />} label={`${property.bathrooms || 0} Baths`} />
            <Info icon={<Maximize />} label={`${property.area || 0} sqft`} />
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold mb-3 dark:text-white">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {property.description || "No description available"}
            </p>
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6 sticky top-24 h-fit">

          {/* PRICE */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-500">Price</p>
            <div className="text-3xl font-bold text-blue-600">
              ₹ {property.price?.toLocaleString() || "N/A"}
            </div>

            <button
              disabled={actionLoading.wishlist}
              onClick={handleWishlist}
              className="mt-4 w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Heart className={isSaved ? "fill-red-500 text-red-500" : ""} />
              {isSaved ? "Saved" : "Save Property"}
            </button>
          </div>

          {/* CONTACT */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow space-y-4">
            <h3 className="font-semibold dark:text-white">Contact Agent</h3>

            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600"
            />

            <textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-600"
            />

            <button
              disabled={actionLoading.inquiry}
              onClick={handleInquiry}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Send Inquiry
            </button>
          </div>

          {/* VISIT */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow space-y-4">
            <h3 className="font-semibold dark:text-white">Schedule Visit</h3>

            <input
              type="datetime-local"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-600"
            />

            <button
              disabled={actionLoading.visit}
              onClick={handleVisit}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Book Visit
            </button>
          </div>

        </div>

      </div>
    </section>
  )
}

function Info({ icon, label }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      {icon}
      <span>{label}</span>
    </div>
  )
}

export default PropertyDetails