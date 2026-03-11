import { useState } from "react"
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa"
import api from "../../services/api"

function ChangePassword() {

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {

    const { name, value } = e.target

    const updatedForm = {
      ...form,
      [name]: value
    }

    setForm(updatedForm)

    if (
      updatedForm.confirmPassword &&
      updatedForm.newPassword !== updatedForm.confirmPassword
    ) {
      setError("Passwords do not match")
    } else {
      setError("")
    }

  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {

      setLoading(true)

      const res = await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      })

      setMessage(res.data.message)
      setError("")

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

    } catch (err) {

      setError(
        err.response?.data?.message || "Password update failed"
      )

    } finally {
      setLoading(false)
    }

  }

  return (

    <div className="bg-[#f4f6fb] min-h-[80vh] flex items-center justify-center px-4">

      <div className="grid md:grid-cols-2 max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* LEFT PANEL */}
        <div className="bg-[#000080] text-white p-10 flex flex-col justify-center">

          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            Change Password <FaLock />
          </h2>

          <p className="text-gray-200">
            Update your password to keep your account secure.
            Always use a strong password that you don't use elsewhere.
          </p>

        </div>

        {/* RIGHT PANEL */}
        <div className="p-10">

          <h3 className="text-2xl font-semibold mb-6">
            Update Password
          </h3>

          {message && (
            <p className="mb-4 text-green-600">
              {message}
            </p>
          )}

          {error && (
            <p className="mb-4 text-red-500">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* CURRENT PASSWORD */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Current Password
              </label>

              <div className="relative">

                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-3 text-gray-500"
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                New Password
              </label>

              <div className="relative">

                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-3 text-gray-500"
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Confirm Password
              </label>

              <div className="relative">

                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-3 text-gray-500"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>

              </div>

              {error && (
                <p className="text-red-500 text-sm mt-1">
                  {error}
                </p>
              )}

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000080] hover:bg-blue-900 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

          </form>

        </div>

      </div>

    </div>

  )
}

export default ChangePassword