import { useState } from "react"
import api from "../../services/api"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaUpload } from "react-icons/fa"

const AddProperty = () => {

  const navigate = useNavigate()

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
  const [loading, setLoading] = useState(false)

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
    setImages(files)
    setPreview(files.map(file => URL.createObjectURL(file)))
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
      setLoading(true)

      const data = new FormData()

      Object.keys(formData).forEach(key => {
        data.append(key, formData[key])
      })

      amenities.forEach(a => data.append("amenities", a))
      images.forEach(img => data.append("images", img))

      await api.post("/properties", data)

      toast.success("Property Added Successfully")
      navigate("/agent/manage-properties")

    } catch {
      toast.error("Failed to Add Property")
    } finally {
      setLoading(false)
    }
  }

  const AMENITIES = [
    "LIFT","GYM","POOL","SECURITY","PARKING",
    "GARDEN","POWER_BACKUP","CLUBHOUSE",
    "PLAY_AREA","WIFI"
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Property</h2>
        <button
          onClick={() => navigate("/agent/manage-properties")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* BASIC INFO */}
          <div>
            <label className="block mb-2 font-medium">Property Title</label>
            <input name="title" value={formData.title}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg" required />
          </div>

          <div>
            <label className="block mb-2 font-medium">Description</label>
            <textarea name="description" value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg" required />
          </div>

          {/* TYPE + PURPOSE */}
          <div className="grid md:grid-cols-3 gap-4">

            <div>
              <label className="block mb-2 font-medium">Property Type</label>
              <select name="type"
                value={formData.type}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full" required>
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
                <option value="BUILDER_FLOOR">Builder Floor</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Purpose</label>
              <select name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full" required>
                <option value="">Select Purpose</option>
                <option value="SELL">Sell</option>
                <option value="RENT">Rent</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Price</label>
              <input name="price"
                value={formData.price}
                onChange={handleChange}
                className="p-3 border rounded-lg w-full" required />
            </div>

          </div>

          {/* NEGOTIABLE */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="priceNegotiable"
              checked={formData.priceNegotiable}
              onChange={handleChange}
            />
            <label>Price Negotiable</label>
          </div>

          {/* AREA */}
          <div>
            <label className="block mb-2 font-medium">Area (sqft)</label>
            <input name="area"
              value={formData.area}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full" />
          </div>

          {/* RESIDENTIAL DETAILS */}
          {!isPlotOrLand && (
            <>
              <div className="grid md:grid-cols-3 gap-4">

                <div>
                  <label className="block mb-2 font-medium">Bedrooms</label>
                  <input name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full" />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Bathrooms</label>
                  <input name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full" />
                </div>

                {!isCommercial && (
                  <div>
                    <label className="block mb-2 font-medium">Balconies</label>
                    <input name="balconies"
                      value={formData.balconies}
                      onChange={handleChange}
                      className="p-3 border rounded-lg w-full" />
                  </div>
                )}

              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">

                <div>
                  <label className="block mb-2 font-medium">Floor</label>
                  <input name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full" />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Total Floors</label>
                  <input name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full" />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Property Age</label>
                  <select name="propertyAge"
                    value={formData.propertyAge}
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full">
                    <option value="">Select</option>
                    <option value="NEW">New</option>
                    <option value="1-5 YEARS">1-5 Years</option>
                    <option value="5-10 YEARS">5-10 Years</option>
                    <option value="10+ YEARS">10+ Years</option>
                  </select>
                </div>

              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">

                <div>
                  <label className="block mb-2 font-medium">Furnishing</label>
                  <select name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full">
                    <option value="">Select</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                    <option value="SEMI_FURNISHED">Semi Furnished</option>
                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Parking</label>
                  <select name="parking"
                    value={formData.parking}
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full">
                    <option value="">Select</option>
                    <option value="NONE">None</option>
                    <option value="BIKE">Bike</option>
                    <option value="CAR">Car</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">Facing</label>
                  <select name="facing"
                    value={formData.facing}
                    onChange={handleChange}
                    className="p-3 border rounded-lg w-full">
                    <option value="">Select</option>
                    <option value="NORTH">North</option>
                    <option value="SOUTH">South</option>
                    <option value="EAST">East</option>
                    <option value="WEST">West</option>
                  </select>
                </div>

              </div>
            </>
          )}

          {/* MAINTENANCE */}
          <div>
            <label className="block mb-2 font-medium">Maintenance Charge</label>
            <input name="maintenanceCharge"
              value={formData.maintenanceCharge}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full" />
          </div>

          {/* LOCATION */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Location Coordinates</h3>
            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block mb-2 font-medium">Latitude</label>
                <input name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  className="p-3 border rounded-lg w-full" />
              </div>

              <div>
                <label className="block mb-2 font-medium">Longitude</label>
                <input name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  className="p-3 border rounded-lg w-full" />
              </div>

            </div>
          </div>

          {/* ADDRESS */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Address Details</h3>

            <input name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full p-3 border rounded-lg mb-4" required />

            <div className="grid md:grid-cols-3 gap-4">
              <input name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="p-3 border rounded-lg w-full" required />

              <input name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="p-3 border rounded-lg w-full" required />

              <input name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="p-3 border rounded-lg w-full" required />
            </div>
          </div>

          {/* AMENITIES */}
          <div>
            <h3 className="font-semibold mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(a => (
                <button type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1 rounded-full border ${
                    amenities.includes(a) ? "bg-blue-600 text-white" : ""
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="block mb-2 font-medium">Upload Images</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed p-6 rounded-lg cursor-pointer">
              <FaUpload className="text-2xl mb-2" />
              Upload Images
              <input type="file"
                multiple
                className="hidden"
                onChange={handleImageChange}
                required />
            </label>
          </div>

          {preview.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {preview.map((img, i) => (
                <img key={i}
                  src={img}
                  className="h-24 w-full object-cover rounded" />
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg">
              {loading ? "Uploading..." : "Add Property"}
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