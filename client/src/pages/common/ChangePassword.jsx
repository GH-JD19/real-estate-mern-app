import { useState, useCallback } from "react"
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

  // ================= PASSWORD STRENGTH =================
  const getPasswordStrength = (password) => {
    if (!password) return ""

    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

    if (!strongRegex.test(password)) return "Weak"
    if (password.length < 12) return "Medium"
    return "Strong"
  }

  const strength = getPasswordStrength(form.newPassword)

  // ================= CHANGE =================
  const handleChange = useCallback((e) => {
    const { name, value } = e.target

    const updatedForm = {
      ...form,
      [name]: value.trimStart()
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

  }, [form])

  // ================= VALIDATION =================
  const validate = () => {

    const { currentPassword, newPassword, confirmPassword } = form

    if (!currentPassword || !newPassword || !confirmPassword) {
      return "All fields are required"
    }

    if (newPassword !== confirmPassword) {
      return "Passwords do not match"
    }

    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/

    if (!strongRegex.test(newPassword)) {
      return "Password must include uppercase, lowercase, number, special character and be at least 8 characters"
    }

    return null
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)

      const res = await api.put(
        "/auth/change-password",
        {
          currentPassword: form.currentPassword.trim(),
          newPassword: form.newPassword.trim()
        },
        { timeout: 10000 }
      )

      setMessage(res?.data?.message || "Password updated successfully")
      setError("")

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

      // auto clear message
      setTimeout(() => setMessage(""), 4000)

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Password update failed"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-[80vh] flex items-center justify-center px-4 py-10 text-gray-900 dark:text-white">

      {/* LOADING */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 px-10 py-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Updating password...
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 max-w-5xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-blue-800 text-white p-10 flex-col justify-center">

          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            Change Password <FaLock />
          </h2>

          <p className="text-blue-100 leading-relaxed">
            Keep your account secure by updating your password regularly.
          </p>

        </div>

        {/* RIGHT */}
        <div className="p-6 md:p-10">

          <h3 className="text-2xl font-semibold mb-6">
            Update Password
          </h3>

          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* CURRENT */}
            <InputField
              label="Current Password"
              name="currentPassword"
              value={form.currentPassword}
              show={showCurrent}
              toggle={() => setShowCurrent(!showCurrent)}
              onChange={handleChange}
            />

            {/* NEW */}
            <InputField
              label="New Password"
              name="newPassword"
              value={form.newPassword}
              show={showNew}
              toggle={() => setShowNew(!showNew)}
              onChange={handleChange}
            />

            {form.newPassword && (
              <p className={`text-sm ${
                strength === "Weak"
                  ? "text-red-500"
                  : strength === "Medium"
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}>
                Strength: {strength}
              </p>
            )}

            {/* CONFIRM */}
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              show={showConfirm}
              toggle={() => setShowConfirm(!showConfirm)}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

          </form>

        </div>

      </div>

    </div>
  )
}

// ================= REUSABLE INPUT =================
const InputField = ({ label, name, value, show, toggle, onChange }) => (
  <div>
    <label className="block mb-1 text-sm font-medium">
      {label}
    </label>

    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
        required
      />

      <button
        type="button"
        onClick={toggle}
        aria-label="Toggle password visibility"
        className="absolute right-4 top-3 text-gray-500"
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  </div>
)

export default ChangePassword