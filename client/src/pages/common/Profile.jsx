import { useEffect, useState } from "react"
import api from "../../services/api"

const Profile = () => {

  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [image, setImage] = useState(null)

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
      value = value.replace(/\D/g, "")
      value = value.slice(0, 10)
    }

    setForm({
      ...form,
      [name]: value
    })
  }

  const handleImage = (e) => {
    setImage(e.target.files[0])
  }

  const handleUpdate = async (e) => {

    e.preventDefault()

    if (form.phone && form.phone.length !== 10) {
      alert("Mobile number must be 10 digits")
      return
    }

    try {

      const formData = new FormData()

      formData.append("name", form.name)
      formData.append("phone", form.phone)
      formData.append("address", form.address)

      if (image) {
        formData.append("photo", image)
      }

      await api.put("/users/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      setEditing(false)

      fetchProfile()

    } catch (err) {
      console.log(err)
    }

  }

  if (!user) return <p>Loading...</p>

  const initials =
    user.name?.split(" ").map(n => n[0]).join("").toUpperCase()

  return (

    <div className="max-w-4xl mx-auto">

      <h2 className="text-2xl font-bold mb-6">
        My Profile
      </h2>

      <div className="bg-white shadow-lg rounded-xl p-8">

        {/* Profile Header */}
        <div className="flex items-center gap-6 border-b pb-6">

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-900 flex items-center justify-center text-white text-2xl font-bold">

            {user.photo ? (
              <img
                src={user.photo}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}

          </div>

          <div>
            <h3 className="text-xl font-semibold">
              {user.name}
            </h3>

            <p className="text-gray-500">
              {user.email}
            </p>

            <span className="inline-block mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              {user.role}
            </span>
          </div>

          <div className="ml-auto">

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              >
                Edit Profile
              </button>
            )}

          </div>

        </div>

        {/* VIEW MODE */}
        {!editing && (

          <div className="grid md:grid-cols-2 gap-6 mt-6">

            <div>
              <p className="text-gray-500 text-sm">Full Name</p>
              <p className="font-medium">{user.name}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Phone</p>
              <p className="font-medium">{user.phone || "Not provided"}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Address</p>
              <p className="font-medium">{user.address || "Not provided"}</p>
            </div>

          </div>

        )}

        {/* EDIT MODE */}
        {editing && (

          <form
            onSubmit={handleUpdate}
            className="grid md:grid-cols-2 gap-6 mt-6"
          >

            <div>
              <label className="text-sm text-gray-500">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength="10"
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-500">
                Address
              </label>

              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-500">
                Profile Photo
              </label>

              <input
                type="file"
                onChange={handleImage}
                className="w-full mt-1"
              />
            </div>

            <div className="md:col-span-2 flex gap-4">

              <button
                type="submit"
                className="bg-blue-900 text-white px-5 py-2 rounded hover:bg-blue-800"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="border px-5 py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </form>

        )}

      </div>

    </div>

  )
}

export default Profile