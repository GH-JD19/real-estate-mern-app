import { useEffect, useState, useRef } from "react"
import api from "../../services/api"

const Profile = () => {

  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile")

      setUser(res.data.user)

      setForm({
        name: res.data.user.name || "",
        phone: res.data.user.phone || "",
        address: res.data.user.address || ""
      })

    } catch (err) {
      console.log(err)
    }
  }

  const handleChange = (e) => {

    let { name, value } = e.target

    if (name === "name" || name === "address") {
      value = value.toUpperCase()
    }

    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10)
    }

    setForm({
      ...form,
      [name]: value
    })
  }

  const handleImage = (e) => {

    const file = e.target.files[0]

    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }

  }

  const handleUpdate = async (e) => {

    e.preventDefault()

    if (form.phone && form.phone.length !== 10) {
      alert("Mobile number must be 10 digits")
      return
    }

    try {

      setLoading(true)

      const formData = new FormData()

      formData.append("name", form.name)
      formData.append("phone", form.phone)
      formData.append("address", form.address)

      if (image) {
        formData.append("photo", image)
      }

      const res = await api.put("/users/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      setMessage(res.data.message || "Profile updated successfully")

      setEditing(false)
      setImage(null)
      setPreview(null)

      fetchProfile()

      setTimeout(() => {
        setMessage("")
      }, 3000)

    } catch (err) {
      console.log(err)
      alert(err.response?.data?.message || "Profile update failed")
    } finally {
      setLoading(false)
    }

  }

  if (!user) return <p className="p-6">Loading...</p>

  const initials =
    user.name?.split(" ").map(n => n[0]).join("").toUpperCase()

  return (

    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen px-4 md:px-8 py-6">

      <div className="max-w-5xl mx-auto">

        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          My Profile
        </h2>

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700">
            {message}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 md:p-8">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">

            <div
              className="relative w-24 h-24 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-2xl font-bold cursor-pointer group"
              onClick={() => editing && fileInputRef.current.click()}
            >

              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : user.photo ? (
                <img src={user.photo} alt="profile" className="w-full h-full object-cover" />
              ) : (
                initials
              )}

              {editing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition">
                  Change
                </div>
              )}

            </div>

            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>

              <span className="inline-block mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {user.role}
              </span>
            </div>

            <div className="md:ml-auto">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

          </div>

          {/* VIEW MODE */}
          {!editing && (

            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 mt-6">

              <Info label="Full Name" value={user.name} />
              <Info label="Email" value={user.email} />
              <Info label="Phone" value={user.phone || "Not provided"} />
              <Info label="Address" value={user.address || "Not provided"} />

            </div>

          )}

          {/* EDIT MODE */}
          {editing && (

            <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-6 mt-6">

              <Input label="Name" name="name" value={form.name} onChange={handleChange} />
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} maxLength="10" />

              <div className="md:col-span-2">
                <Input label="Address" name="address" value={form.address} onChange={handleChange} />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-500">Profile Photo</label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImage}
                  className="w-full mt-2"
                />

                <p className="text-xs text-gray-400 mt-1">
                  JPG or PNG. Max size 2MB.
                </p>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-4">

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setPreview(null)
                  }}
                  className="border px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>

              </div>

            </form>

          )}

        </div>

      </div>

    </div>

  )
}

// ===============================
// REUSABLE COMPONENTS
// ===============================
const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
)

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-500">{label}</label>
    <input
      {...props}
      className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
    />
  </div>
)

export default Profile