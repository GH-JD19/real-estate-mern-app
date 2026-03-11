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


  // ================= FETCH PROPERTY =================
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


  // ================= CHECK WISHLIST =================
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


  // ================= WISHLIST =================
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


  // ================= CONTACT AGENT =================
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


  // ================= BOOK VISIT =================
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


  // ================= LOADING =================
  if (loading) {

    return (
      <div className="text-center py-20 text-gray-500">
        Loading property...
      </div>
    )

  }

  if (!property) {

    return (
      <div className="text-center py-20 text-red-500">
        Property not found
      </div>
    )

  }


  return (

    <div className="bg-[#f4f6fb] min-h-screen py-10">

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">

        {/* TITLE */}
        <div className="flex justify-between items-start mb-6">

          <div>

            <h1 className="text-3xl font-bold text-gray-800">
              {property.title}
            </h1>

            <p className="flex items-center text-gray-500 mt-2">
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
        <div className="mb-10">

          <img
            src={getImageUrl(property?.media?.images?.[activeImage])}
            onError={(e)=>e.target.src="/no-image.jpg"}
            alt="property"
            className="w-full h-[420px] object-cover rounded-xl shadow"
          />

          <div className="flex gap-3 mt-4 overflow-x-auto">

            {property?.media?.images?.map((img, index) => (

              <img
                key={index}
                src={getImageUrl(img)}
                alt=""
                onClick={() => setActiveImage(index)}
                className={`w-28 h-20 object-cover rounded cursor-pointer border 
                ${activeImage === index ? "border-blue-600" : "border-gray-200"}`}
              />

            ))}

          </div>

        </div>


        {/* PROPERTY INFO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">

          <div className="flex items-center gap-2 bg-white shadow rounded-lg p-4">
            <BedDouble size={20} />
            <span>{property.beds || 0} Beds</span>
          </div>

          <div className="flex items-center gap-2 bg-white shadow rounded-lg p-4">
            <Bath size={20} />
            <span>{property.baths || 0} Baths</span>
          </div>

          <div className="flex items-center gap-2 bg-white shadow rounded-lg p-4">
            <Maximize size={20} />
            <span>{property.area || 0} sqft</span>
          </div>

          <div className="flex items-center gap-2 bg-white shadow rounded-lg p-4">
            <MapPin size={20} />
            <span>{property.type}</span>
          </div>

        </div>


        {/* PRICE */}
        <p className="text-3xl font-bold text-blue-700 mb-6">
          ₹ {property.price?.toLocaleString()}
        </p>


        {/* VISIT + INQUIRY SECTION */}
        <div className="grid md:grid-cols-2 gap-10 mb-12">

          {/* CONTACT AGENT */}
          <form onSubmit={handleInquiry} className="bg-white p-6 rounded-xl shadow space-y-4">

            <h3 className="text-xl font-semibold">
              Contact Agent
            </h3>

            <input
              type="text"
              placeholder="Phone number"
              required
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <textarea
              placeholder="Message"
              required
              value={message}
              onChange={(e)=>setMessage(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <button
              type="submit"
              className="bg-[#000080] hover:bg-blue-900 text-white py-3 w-full rounded-lg font-semibold"
            >
              Send Inquiry
            </button>

          </form>


          {/* SCHEDULE VISIT */}
          <form onSubmit={handleVisit} className="bg-white p-6 rounded-xl shadow space-y-4">

            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Calendar size={18} />
              Schedule Visit
            </h3>

            <input
              type="datetime-local"
              required
              value={visitDate}
              onChange={(e)=>setVisitDate(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <textarea
              placeholder="Message (optional)"
              value={visitMessage}
              onChange={(e)=>setVisitMessage(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />

            <button
              type="submit"
              className="bg-green-600 text-white py-3 w-full rounded-lg font-semibold"
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
            className="rounded-xl border"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${property.location.lat},${property.location.lng}&z=15&output=embed`}
          ></iframe>

        )}

      </div>

    </div>

  )

}

export default PropertyDetails