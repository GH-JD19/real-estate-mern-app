import { useState, useRef, useEffect } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaUpload } from "react-icons/fa"

const AddProperty = () => {

  const navigate = useNavigate()

  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    type: "",
    purpose: "",
    priceNegotiable: false,
    address: "",
    city: "",
    state: "",
    pincode: "",
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    area: "",
    floor: "",
    totalFloors: "",
    furnishing: "",
    parking: "",
    propertyAge: "",
    facing: "",
    maintenanceCharge: "",
    lat: "",
    lng: ""
  })

  const [amenities, setAmenities] = useState([])
  const [images, setImages] = useState([])
  const [preview, setPreview] = useState([])

  const isPlotOrLand =
    formData.type === "PLOT" || formData.type === "LAND"

  const isCommercial =
    ["COMMERCIAL", "SHOP", "OFFICE", "WAREHOUSE"].includes(formData.type)

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked })
      return
    }

    if (["title", "address", "city", "state"].includes(name)) {
      value = value.toUpperCase().replace(/[^A-Z0-9\s]/g, "")
    }

    if (name === "description") {
      value = value.toUpperCase()
    }

    if ([
      "price",
      "pincode",
      "bedrooms",
      "bathrooms",
      "balconies",
      "area",
      "floor",
      "totalFloors",
      "maintenanceCharge"
    ].includes(name)) {
      value = value.replace(/\D/g, "")
    }

    if (["lat", "lng"].includes(name)) {
      value = value.replace(/[^\d.-]/g, "")
    }

    setFormData({ ...formData, [name]: value })
  }

  const toggleAmenity = (item) => {
    setAmenities(prev =>
      prev.includes(item)
        ? prev.filter(a => a !== item)
        : [...prev, item]
    )
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    const MAX_IMAGES = 10
    const MAX_SIZE_MB = 5

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Max ${MAX_IMAGES} images allowed`)
      return
    }

    const validFiles = []

    for (let file of files) {

      // only images
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files allowed")
        continue
      }

      // size check
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} is too large`)
        continue
      }

      // duplicate check
      const exists = images.some(
        img => img.name === file.name && img.size === file.size
      )

      if (!exists) validFiles.push(file)
    }

    const newPreviews = validFiles.map(file => URL.createObjectURL(file))

    setImages(prev => [...prev, ...validFiles])
    setPreview(prev => [...prev, ...newPreviews])

    // reset input (important)
    fileInputRef.current.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.price) {
      toast.error("Please fill all required fields")
      return
    }

    if (!formData.type || !formData.purpose) {
      toast.error("Please select Property Type and Purpose")
      return
    }

    if (formData.pincode && formData.pincode.length !== 6) {
      toast.error("Pincode must be 6 digits")
      return
    }

    if (!images.length) {
      toast.error("Please upload at least one image")
      return
    }

    try {
      const data = new FormData()

      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]?.toString().trim())
      })

      amenities.forEach(a => data.append("amenities", a))
      images.forEach(img => data.append("images", img))

      await api.post("/properties", data)

      toast.success("Property Added Successfully")
      navigate("/agent/manage-properties")

    } catch {
      toast.error("Failed to Add Property")
    } 
  }

  const AMENITIES = [
    { label: "LIFT", value: "LIFT" },
    { label: "GYM", value: "GYM" },
    { label: "POOL", value: "POOL" },
    { label: "SECURITY", value: "SECURITY" },
    { label: "PARKING", value: "PARKING" },
    { label: "GARDEN", value: "GARDEN" },
    { label: "POWER BACKUP", value: "POWER_BACKUP" },
    { label: "CLUBHOUSE", value: "CLUBHOUSE" },
    { label: "PLAY AREA", value: "PLAY_AREA" },
    { label: "WIFI", value: "WIFI" }
  ]

  const removeImage = (index) => {
    URL.revokeObjectURL(preview[index])

    setImages(prev => prev.filter((_, i) => i !== index))
    setPreview(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    return () => {
      preview.forEach(url => URL.revokeObjectURL(url))
    }
  }, [preview])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-3 sm:px-6 py-4">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Property</h2>
        <button
          onClick={() => navigate("/agent/manage-properties")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFO */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div>
              <label className="block mb-2 font-medium">Property Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {/* TYPE + PURPOSE */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition space-y-4">
            <h3 className="text-lg font-semibold">Property Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

              <div>
                <label className="block mb-2 font-medium">Property Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg dark:bg-gray-900"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="PLOT">Plot</option>
                  <option value="LAND">Land</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="SHOP">Shop</option>
                  <option value="OFFICE">Office</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="PG">PG</option>
                  <option value="BUILDER FLOOR">Builder Floor</option>
                  <option value="PENTHOUSE">Penthouse</option>
                  <option value="STUDIO">Studio</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Purpose</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg dark:bg-gray-900"
                  required
                >
                  <option value="">Select Purpose</option>
                  <option value="SELL">Sell</option>
                  <option value="RENT">Rent</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Price</label>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg dark:bg-gray-900"
                  required
                />
              </div>

            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="priceNegotiable"
                checked={formData.priceNegotiable}
                onChange={handleChange}
              />
              <label>Price Negotiable</label>
            </div>
          </div>

          {/* PROPERTY SPECIFICATIONS */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm space-y-6">

            <h3 className="text-lg font-semibold">Property Specifications</h3>

            {/* AREA */}
            <div>
              <label className="block mb-2 font-medium">Area (sqft)</label>
              <input
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* RESIDENTIAL DETAILS */}
            <div className="border-t pt-6">
              {!isPlotOrLand && (
                <div className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                    <div>
                      <label className="block mb-2 font-medium">Bedrooms</label>
                      <input
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Bathrooms</label>
                      <input
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {!isCommercial && (
                      <div>
                        <label className="block mb-2 font-medium">Balconies</label>
                        <input
                          name="balconies"
                          value={formData.balconies}
                          onChange={handleChange}
                          className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                    <div>
                      <label className="block mb-2 font-medium">Floor</label>
                      <input
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Total Floors</label>
                      <input
                        name="totalFloors"
                        value={formData.totalFloors}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Property Age</label>
                      <select
                        name="propertyAge"
                        value={formData.propertyAge}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select</option>
                        <option value="NEW">New</option>
                        <option value="1-5 YEARS">1-5 Years</option>
                        <option value="5-10 YEARS">5-10 Years</option>
                        <option value="10+ YEARS">10+ Years</option>
                      </select>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

                    <div>
                      <label className="block mb-2 font-medium">Furnishing</label>
                      <select
                        name="furnishing"
                        value={formData.furnishing}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select</option>
                        <option value="FULLY_FURNISHED">FULLY FURNISHED</option>
                        <option value="SEMI_FURNISHED">SEMI FURNISHED</option>
                        <option value="UNFURNISHED">UNFURNISHED</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Parking</label>
                      <select
                        name="parking"
                        value={formData.parking}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select</option>
                        <option value="NONE">None</option>
                        <option value="BIKE">Bike</option>
                        <option value="CAR">Car</option>
                        <option value="BOTH">Both</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium">Facing</label>
                      <select
                        name="facing"
                        value={formData.facing}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select</option>
                        <option value="NORTH">North</option>
                        <option value="SOUTH">South</option>
                        <option value="EAST">East</option>
                        <option value="WEST">West</option>
                      </select>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* MAINTENANCE */}
            <div className="border-t pt-6">
              <div>
                <label className="block mb-2 font-medium">Maintenance Charge</label>
                <input
                  name="maintenanceCharge"
                  value={formData.maintenanceCharge}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

          </div>

          {/* LOCATION */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm space-y-4 mt-6">

            <h3 className="text-lg font-semibold">Location Coordinates</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block mb-2 font-medium">Latitude</label>
                <input
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Longitude</label>
                <input
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

            </div>
          </div>

          {/* ADDRESS */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition space-y-4">
            <h3 className="text-lg font-semibold">Address Details</h3>

            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full p-3 border rounded-lg dark:bg-gray-900"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <input name="city" value={formData.city} onChange={handleChange}
                placeholder="City"
                className="p-3 border rounded-lg w-full dark:bg-gray-900" />

              <input name="state" value={formData.state} onChange={handleChange}
                placeholder="State"
                className="p-3 border rounded-lg w-full dark:bg-gray-900" />

              <input name="pincode" value={formData.pincode} onChange={handleChange}
                placeholder="Pincode"
                className="p-3 border rounded-lg w-full dark:bg-gray-900" />
            </div>
          </div>

          {/* AMENITIES */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition space-y-4">
            <h3 className="text-lg font-semibold">Amenities</h3>

            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(a => (
                <button
                  type="button"
                  key={a.value}
                  onClick={() => toggleAmenity(a.value)}
                  className={`px-4 py-2 text-sm rounded-full border transition ${
                    amenities.includes(a.value)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-sm space-y-4 mt-6">

            <h3 className="text-lg font-semibold">Property Images</h3>

            {/* Upload Box */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed p-6 rounded-xl cursor-pointer hover:border-blue-500 transition">
              <FaUpload className="text-2xl mb-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload (Max 10 images)
              </span>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            {/* Preview Grid */}
            {preview.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {preview.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      className="h-24 w-full object-cover rounded-lg cursor-pointer"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-lg w-full sm:w-auto shadow">
              Add Property
            </button>

            <button type="button"
              onClick={() => navigate("/agent/manage-properties")}
              className="bg-gray-300 dark:bg-gray-600 px-6 py-3 rounded-lg">
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AddProperty