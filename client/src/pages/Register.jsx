import { useState, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { FiMail, FiUser, FiPhone, FiMapPin } from "react-icons/fi"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  })

  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isEmailValid = emailRegex.test(form.email)
  const isPhoneValid = form.phone.length === 10
  const isPasswordMatch =
    form.password && form.password === form.confirmPassword

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return "Weak"
    if (/[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8)
      return "Strong"
    return "Medium"
  }

  const handleChange = (e) => {
    let { name, value } = e.target

    if (name === "name" || name === "address") value = value.toUpperCase()

    if (name === "email") value = value.trim().toLowerCase()

    if (name === "phone") value = value.replace(/\D/g, "").slice(0, 10)

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value))
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError("")

    if (!isEmailValid) {
      toast.error("Enter a valid email")
      return
    }

    if (!isPhoneValid) {
      toast.error("Enter valid 10-digit mobile number")
      return
    }

    if (!isPasswordMatch) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      await toast.promise(
        api.post("/auth/register", {
          ...form,
          role: form.role.toLowerCase(),
        }),
        {
          loading: "Creating your account...",
          success: "Account created successfully 🎉",
          error: (err) => {
            const msg = err.response?.data?.message || "Registration failed"
            if (msg.toLowerCase().includes("email"))
              return "Email already registered"
            if (msg.toLowerCase().includes("phone"))
              return "Mobile already registered"
            return msg
          },
        }
      )

      navigate("/pending-approval")

    } catch (err) {
      const message = err.response?.data?.message || "Registration failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [form, isEmailValid, isPhoneValid, isPasswordMatch, navigate])

  const strengthColor = {
    Weak: "text-red-500",
    Medium: "text-yellow-500",
    Strong: "text-green-500",
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-10">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex-col justify-center p-10 space-y-6">
          <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-[-50px] left-[-50px]" />

          <h2 className="text-3xl font-bold z-10">Join Us 🚀</h2>
          <p className="text-lg opacity-90 z-10">
            Create your account and start exploring properties today.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12">

          <header>
            <h2 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
              Create your account
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Fill in your details to get started
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* ROLE */}
            <div>
              <label htmlFor="role" className="text-sm text-gray-600 dark:text-gray-300">
                Register As
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:bg-gray-900"
              >
                <option value="USER">USER</option>
                <option value="AGENT">AGENT</option>
              </select>
            </div>

            {/* NAME */}
            <div>
              <label htmlFor="name" className="text-sm text-gray-600 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mt-1 pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:bg-gray-900"
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <label htmlFor="address" className="text-sm text-gray-600 dark:text-gray-300">
                Address
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full mt-1 pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:bg-gray-900"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="text-sm text-gray-600 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={form.email && !isEmailValid}
                  className={`w-full mt-1 pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:bg-gray-900
                    ${form.email && !isEmailValid ? "border-red-500" : ""}
                    ${form.email && isEmailValid ? "border-green-500" : ""}
                  `}
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label htmlFor="phone" className="text-sm text-gray-600 dark:text-gray-300">
                Mobile Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full mt-1 pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:bg-gray-900"
                />
              </div>
              {form.phone && !isPhoneValid && (
                <p className="text-sm text-red-500">
                  Mobile number must be 10 digits
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="text-sm text-gray-600 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full mt-1 pl-3 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {form.password && (
                <p className={`text-sm ${strengthColor[passwordStrength]}`}>
                  Strength: {passwordStrength}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label htmlFor="confirmPassword" className="text-sm text-gray-600 dark:text-gray-300">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full mt-1 pl-3 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:bg-gray-900"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-label="Toggle confirm password visibility"
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {form.confirmPassword && !isPasswordMatch && (
                <p className="text-sm text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* ERROR */}
            {error && <p className="text-red-500 text-sm">⚠️ {error}</p>}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={
                loading ||
                !form.name ||
                !form.address ||
                !isEmailValid ||
                !isPhoneValid ||
                !form.password ||
                !isPasswordMatch
              }
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {loading ? "Creating..." : "Register"}
            </button>

            {/* LOGIN */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
              >
                Login
              </Link>
            </div>

          </form>

        </div>

      </div>

    </section>
  )
}

export default Register