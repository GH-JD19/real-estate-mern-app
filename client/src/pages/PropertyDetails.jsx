import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

import { FaHeart, FaRegHeart } from "react-icons/fa"
import { BedDouble, Bath, Maximize, MapPin, Calendar } from "lucide-react"

import {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} from "../services/wishlistService"

import { sendInquiry } from "../services/inquiryService"
import { bookVisit } from "../services/visitService"

import { getImageUrl } from "../utils/getImageUrl"

function PropertyDetails() {

  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [property, setProperty] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const [activeImage, setActiveImage] = useState(0)

  const [message, setMessage] = useState("")
  const [phone, setPhone] = useState("")

  const [visitDate, setVisitDate] = useState("")
  const [visitMessage, setVisitMessage] = useState("")

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`)
        setProperty(res.data.property)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [id])

  useEffect(() => {
    const checkWishlist = async () => {
      if (!token || !property) return
      try {
        const res = await getWishlist(token)
        const wishlist = res.data.properties || []
        const exists = wishlist.some(
          item => item._id?.toString() === property._id?.toString()
        )
        setSaved(exists)
      } catch (err) {
        console.log(err)
      }
    }
    checkWishlist()
  }, [property, token])

  const handleWishlist = async () => {
    if (!token) return navigate("/login")
    try {
      if (saved) {
        await removeFromWishlist(property._id, token)
        setSaved(false)
      } else {
        await addToWishlist(property._id, token)
        setSaved(true)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const handleInquiry = async (e) => {
    e.preventDefault()
    if (!token) return navigate("/login")

    try {
      await sendInquiry(property._id, { message, phone })
      alert("Inquiry sent successfully")
      setMessage("")
      setPhone("")
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send inquiry")
    }
  }

  const handleVisit = async (e) => {
    e.preventDefault()
    if (!token) return navigate("/login")

    try {
      await bookVisit(property._id, {
        visitDate,
        message: visitMessage
      })
      alert("Visit scheduled successfully")
      navigate("/user/bookings")
    } catch (error) {
      alert(error.response?.data?.message || "Failed to schedule visit")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="text-center py-32 text-red-500 text-lg">
        Property not found
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* TITLE */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              {property.title}
            </h1>
            <p className="flex items-center text-gray-500 mt-3">
              <MapPin size={16} className="mr-1" />
              {property.location?.lat}, {property.location?.lng}
            </p>
          </div>

          <button
            onClick={handleWishlist}
            className="text-red-500 text-4xl hover:scale-110 transition"
          >
            {saved ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        {/* IMAGE */}
        <div className="mb-14">
          <img
            src={getImageUrl(property?.media?.images?.[activeImage])}
            onError={(e)=>e.target.src="/no-image.jpg"}
            alt="property"
            className="w-full h-[450px] object-cover rounded-2xl shadow-xl"
          />

          <div className="flex gap-3 mt-5 overflow-x-auto">
            {property?.media?.images?.map((img, index) => (
              <img
                key={index}
                src={getImageUrl(img)}
                onClick={() => setActiveImage(index)}
                className={`w-28 h-20 object-cover rounded-lg cursor-pointer transition 
                ${activeImage === index ? "ring-2 ring-blue-600 scale-105" : "opacity-70 hover:opacity-100"}`}
              />
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[ 
            { icon: <BedDouble />, label: `${property.beds || 0} Beds` },
            { icon: <Bath />, label: `${property.baths || 0} Baths` },
            { icon: <Maximize />, label: `${property.area || 0} sqft` },
            { icon: <MapPin />, label: property.type }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* PRICE */}
        <div className="text-4xl font-bold text-blue-600 mb-14">
          ₹ {property.price?.toLocaleString()}
        </div>

        {/* FORMS */}
        <div className="grid md:grid-cols-2 gap-10 mb-16">

          {/* CONTACT */}
          <form onSubmit={handleInquiry} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg space-y-5">
            <h3 className="text-2xl font-semibold dark:text-white">
              Contact Agent
            </h3>

            <input
              type="text"
              placeholder="Phone number"
              required
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <textarea
              placeholder="Message"
              required
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 w-full rounded-lg font-semibold">
              Send Inquiry
            </button>
          </form>

          {/* VISIT */}
          <form onSubmit={handleVisit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg space-y-5">
            <h3 className="text-2xl font-semibold flex items-center gap-2 dark:text-white">
              <Calendar size={18} /> Schedule Visit
            </h3>

            <input
              type="datetime-local"
              required
              value={visitDate}
              onChange={(e)=>setVisitDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600"
            />

            <textarea
              placeholder="Message (optional)"
              value={visitMessage}
              onChange={(e)=>setVisitMessage(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <button className="bg-green-600 hover:bg-green-700 text-white py-3 w-full rounded-lg font-semibold">
              Book Visit
            </button>
          </form>

        </div>

        {/* MAP */}
        {property.location?.lat && property.location?.lng && (
          <iframe
            title="map"
            width="100%"
            height="380"
            className="rounded-2xl shadow-lg border"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${property.location.lat},${property.location.lng}&z=15&output=embed`}
          />
        )}

      </div>
    </div>
  )
}

export default PropertyDetails