import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import api from "../../services/api"
import socket from "../../services/socket"
import { toast } from "react-toastify"

const AdminViewProperty = () => {

  const { id } = useParams()
  const navigate = useNavigate()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  const [rejectReason, setRejectReason] = useState("")
  const [showRejectBox, setShowRejectBox] = useState(false)
  const [adminNote, setAdminNote] = useState("")

  const fetchProperty = async () => {
    try {
      const res = await api.get(`/properties/${id}`)
      setProperty(res.data.property)
      setAdminNote(res.data.property.adminNote || "")
    } catch {
      toast.error("Failed to load property")
    } finally {
      setLoading(false)
    }
  }

  // 🚀 REAL-TIME + INITIAL LOAD
  useEffect(() => {

    fetchProperty()

    if (!socket.connected) {
      socket.connect()
      socket.emit("joinAdmin")
    }

    const handleUpdate = () => {
      console.log("Realtime property update")
      fetchProperty()
    }

    socket.on("dashboard:update", handleUpdate)

    return () => {
      socket.off("dashboard:update", handleUpdate)
    }

  }, [id])

  const safeValue = (value) => {
    if (value === null || value === undefined || value === "" || value === 0) {
      return "NA"
    }
    return value
  }

  const handleApprove = async () => {
    try {
      await api.put(`/properties/admin/status/${id}`, {
        status: "APPROVED",
        adminNote
      })
      toast.success("Property Approved")
      fetchProperty()
    } catch {
      toast.error("Approval failed")
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter rejection reason")
      return
    }

    try {
      await api.put(`/properties/admin/status/${id}`, {
        status: "REJECTED",
        rejectionReason: rejectReason,
        adminNote
      })

      toast.error("Property Rejected")
      setShowRejectBox(false)
      setRejectReason("")
      fetchProperty()
    } catch {
      toast.error("Rejection failed")
    }
  }

  const handleFeature = async () => {
    try {
      await api.put(`/properties/admin/feature/${id}`, {
        featured: true
      })
      toast.success("Marked as Featured")
      fetchProperty()
    } catch {
      toast.error("Failed to mark as featured")
    }
  }

  const handleUnfeature = async () => {
    try {
      await api.put(`/properties/admin/feature/${id}`, {
        featured: false
      })
      toast.success("Removed from Featured")
      fetchProperty()
    } catch {
      toast.error("Failed to remove featured")
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?")) return

    try {
      await api.delete(`/properties/admin/${id}`)
      toast.success("Property Deleted")
      navigate("/admin/properties")
    } catch {
      toast.error("Delete failed")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-500"
      case "PENDING": return "bg-yellow-500"
      case "REJECTED": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading property details...
    </div>
  )

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Property not found
    </div>
  )

  const isLand = property.type === "LAND" || property.type === "PLOT"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-6 text-gray-900 dark:text-white">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">

        <div>
          <h2 className="text-3xl font-bold flex flex-wrap items-center gap-3">

            {property.title}

            {property.featured && new Date(property.featuredTill) > new Date() && (
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs shadow">
                FEATURED
              </span>
            )}

          </h2>

          {property.featured && property.featuredTill && (
            <p className="text-sm text-yellow-600 mt-1">
              Featured till: {new Date(property.featuredTill).toLocaleDateString()}
            </p>
          )}
        </div>

        <button
          onClick={() => navigate("/admin/properties")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          <FaArrowLeft /> Back
        </button>

      </div>

      {/* STATUS */}
      <div className="mb-6">
        <span className={`text-white px-4 py-1 rounded-full text-sm shadow ${getStatusBadge(property.status)}`}>
          {property.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* IMAGE SECTION */}
        <div>
          <img
            src={property.media?.images?.[activeImage] || "/no-image.jpg"}
            alt="Property"
            className="w-full h-96 object-cover rounded-2xl shadow"
          />

          {property.media?.images?.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {property.media.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  onClick={() => setActiveImage(index)}
                  className={`w-24 h-20 object-cover rounded cursor-pointer border-2 ${
                    activeImage === index ? "border-blue-500" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="space-y-6">

          {/* PROPERTY INFO */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold mb-4">Property Overview</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Price:</strong> ₹ {property.price?.toLocaleString() || "NA"}</p>
              <p><strong>Purpose:</strong> {safeValue(property.purpose)}</p>
              <p><strong>Type:</strong> {safeValue(property.type)}</p>
              <p><strong>Area:</strong> {safeValue(property.area)} sq.ft</p>

              {!isLand && (
                <>
                  <p><strong>Bedrooms:</strong> {safeValue(property.bedrooms)}</p>
                  <p><strong>Bathrooms:</strong> {safeValue(property.bathrooms)}</p>
                  <p><strong>Balconies:</strong> {safeValue(property.balconies)}</p>
                  <p><strong>Floor:</strong> {safeValue(property.floor)}</p>
                  <p><strong>Total Floors:</strong> {safeValue(property.totalFloors)}</p>
                  <p><strong>Furnishing:</strong> {safeValue(property.furnishing)}</p>
                  <p><strong>Parking:</strong> {safeValue(property.parking)}</p>
                  <p><strong>Property Age:</strong> {safeValue(property.propertyAge)}</p>
                </>
              )}

              <p><strong>Facing:</strong> {safeValue(property.facing)}</p>
              <p><strong>Pincode:</strong> {safeValue(property.pincode)}</p>
            </div>
          </div>

          {/* LOCATION */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <p><strong>City:</strong> {safeValue(property.city)}</p>
            <p><strong>State:</strong> {safeValue(property.state)}</p>
            <p><strong>Address:</strong> {safeValue(property.address)}</p>
            <p><strong>Latitude:</strong> {safeValue(property.location?.lat)}</p>
            <p><strong>Longitude:</strong> {safeValue(property.location?.lng)}</p>
          </div>

          {/* AMENITIES */}
          {property.amenities?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a, i) => (
                  <span key={i} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* OWNER INFO */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold mb-4">Owner Information</h3>
            <p><strong>Name:</strong> {safeValue(property.createdBy?.name)}</p>
            <p><strong>Email:</strong> {safeValue(property.createdBy?.email)}</p>
            <p><strong>Role:</strong> {safeValue(property.createdBy?.role)}</p>
          </div>

          {/* ADMIN NOTE */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold mb-4">Admin Notes</h3>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full p-3 rounded border dark:bg-gray-700"
            />
          </div>

          {/* REJECTION BOX */}
          {showRejectBox && (
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 rounded border mb-3 text-black"
              />
              <div className="flex gap-3">
                <button onClick={handleReject} className="bg-red-600 text-white px-4 py-2 rounded">
                  Confirm Reject
                </button>
                <button onClick={() => setShowRejectBox(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-4 flex-wrap">

            {property.status === "PENDING" && (
              <>
                <button onClick={handleApprove} className="bg-green-600 text-white px-5 py-2 rounded-lg">
                  Approve
                </button>
                <button onClick={() => setShowRejectBox(true)} className="bg-red-600 text-white px-5 py-2 rounded-lg">
                  Reject
                </button>
              </>
            )}

            {property.status === "APPROVED" && (
              <>
                {!property.featured ? (
                  <button onClick={handleFeature} className="bg-yellow-500 text-white px-5 py-2 rounded-lg">
                    Mark as Featured
                  </button>
                ) : (
                  <button onClick={handleUnfeature} className="bg-purple-600 text-white px-5 py-2 rounded-lg">
                    Remove Featured
                  </button>
                )}
              </>
            )}

            <button onClick={handleDelete} className="bg-gray-800 text-white px-5 py-2 rounded-lg">
              Delete
            </button>

          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminViewProperty