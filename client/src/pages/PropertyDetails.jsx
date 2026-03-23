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

    if (!token) {
      navigate("/login")
      return
    }

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

    if (!token) {
      navigate("/login")
      return
    }

    try {

      await sendInquiry(property._id, {
        message,
        phone
      })

      alert("Inquiry sent successfully")

      setMessage("")
      setPhone("")

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to send inquiry"
      )

    }

  }


  const handleVisit = async (e) => {

    e.preventDefault()

    if (!token) {
      navigate("/login")
      return
    }

    try {

      await bookVisit(property._id, {
        visitDate,
        message: visitMessage
      })

      alert("Visit scheduled successfully")

      navigate("/user/bookings")

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to schedule visit"
      )

    }

  }


  if (loading) {

    return (

      <div className="flex justify-center py-24">

        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

      </div>

    )

  }


  if (!property) {

    return (

      <div className="text-center py-24 text-red-500">
        Property not found
      </div>

    )

  }


  return (

    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-14">

      <div className="max-w-7xl mx-auto px-6">

        {/* TITLE */}
        <div className="flex justify-between items-start mb-8">

          <div>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {property.title}
            </h1>

            <p className="flex items-center text-gray-500 dark:text-gray-400 mt-2">
              <MapPin size={16} className="mr-1" />
              {property.location?.lat}, {property.location?.lng}
            </p>

          </div>

          <button
            onClick={handleWishlist}
            className="text-red-500 text-3xl hover:scale-110 transition"
          >
            {saved ? <FaHeart /> : <FaRegHeart />}
          </button>

        </div>


        {/* IMAGE GALLERY */}
        <div className="mb-12">

          <img
            src={getImageUrl(property?.media?.images?.[activeImage])}
            onError={(e)=>e.target.src="/no-image.jpg"}
            alt="property"
            className="w-full h-[420px] object-cover rounded-xl shadow-lg"
          />

          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">

            {property?.media?.images?.map((img, index) => (

              <img
                key={index}
                src={getImageUrl(img)}
                alt=""
                onClick={() => setActiveImage(index)}
                className={`w-28 h-20 object-cover rounded cursor-pointer border 
                hover:scale-105 transition
                ${activeImage === index ? "border-blue-600" : "border-gray-200"}`}
              />

            ))}

          </div>

        </div>


        {/* PROPERTY INFO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">

          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 shadow rounded-xl p-5">
            <BedDouble size={20} />
            <span>{property.beds || 0} Beds</span>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 shadow rounded-xl p-5">
            <Bath size={20} />
            <span>{property.baths || 0} Baths</span>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 shadow rounded-xl p-5">
            <Maximize size={20} />
            <span>{property.area || 0} sqft</span>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 shadow rounded-xl p-5">
            <MapPin size={20} />
            <span>{property.type}</span>
          </div>

        </div>


        {/* PRICE */}
        <p className="text-3xl font-bold text-blue-600 mb-10">
          ₹ {property.price?.toLocaleString()}
        </p>


        {/* CONTACT + VISIT */}
        <div className="grid md:grid-cols-2 gap-10 mb-14">


          {/* CONTACT FORM */}
          <form onSubmit={handleInquiry} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">

            <h3 className="text-xl font-semibold dark:text-white">
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

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 w-full rounded-lg font-semibold transition"
            >
              Send Inquiry
            </button>

          </form>


          {/* VISIT FORM */}
          <form onSubmit={handleVisit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">

            <h3 className="text-xl font-semibold flex items-center gap-2 dark:text-white">
              <Calendar size={18} />
              Schedule Visit
            </h3>

            <input
              type="datetime-local"
              required
              value={visitDate}
              onChange={(e)=>setVisitDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <textarea
              placeholder="Message (optional)"
              value={visitMessage}
              onChange={(e)=>setVisitMessage(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white py-3 w-full rounded-lg font-semibold transition"
            >
              Book Visit
            </button>

          </form>

        </div>


        {/* MAP */}
        {property.location?.lat && property.location?.lng && (

          <iframe
            title="map"
            width="100%"
            height="350"
            className="rounded-xl border shadow"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${property.location.lat},${property.location.lng}&z=15&output=embed`}
          ></iframe>

        )}

      </div>

    </div>

  )

}

export default PropertyDetails