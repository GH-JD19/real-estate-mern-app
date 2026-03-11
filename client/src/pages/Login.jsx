import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [emailError, setEmailError] = useState("")
  const [emailValid, setEmailValid] = useState(null)
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const { login } = useAuth()

  const validateEmail = (value) => {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!value) {
      setEmailError("")
      setEmailValid(null)
    } else if (!regex.test(value)) {
      setEmailError("Please enter a valid email")
      setEmailValid(false)
    } else {
      setEmailError("")
      setEmailValid(true)
    }

  }

  const handleSubmit = async (e) => {

    e.preventDefault()
    setError("")

    validateEmail(email)

    if (!email || emailValid === false) return

    try {

      setLoading(true)

      const { data } = await api.post("/auth/login", {
        email,
        password
      })

      const { token, user } = data

      login(user, token, keepLoggedIn)

      const pendingProperty = localStorage.getItem("pendingWishlist")

      if (pendingProperty) {

        try {
          await api.put(`/wishlist/add/${pendingProperty}`)
          localStorage.removeItem("pendingWishlist")
        } catch (err) {
          console.log(err)
        }

      }

      if (user.role === "admin") navigate("/admin-dashboard")
      else if (user.role === "agent") navigate("/agent-dashboard")
      else navigate("/user-dashboard")

    } catch (err) {

      setError(err.response?.data?.message || "Login failed")

    } finally {

      setLoading(false)

    }

  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white px-10 py-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#000080] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-gray-700">Signing you in...</p>
          </div>
        </div>
      )}

      <div className="min-h-[80vh] flex items-center justify-center bg-[#f4f6fb] px-4">

        <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">

          <div className="hidden md:flex bg-[#000080] text-white flex-col justify-center p-10">
            <h2 className="text-3xl font-bold mb-4">Welcome Back 👋</h2>
            <p className="text-lg opacity-90">
              Login to manage your properties, track listings and explore opportunities.
            </p>
          </div>

          <div className="p-8 md:p-12">

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Login to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="text-sm text-gray-600">Email</label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase()
                    setEmail(value)
                    validateEmail(value)
                  }}
                  className={`w-full mt-1 p-3 border rounded-lg outline-none
                    ${emailValid === false ? "border-red-500" : ""}
                    ${emailValid === true ? "border-green-500" : ""}
                  `}
                  placeholder="Enter your email"
                />

                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}

              </div>

              <div>

                <label className="text-sm text-gray-600">Password</label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#000080]"
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-4 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>

                </div>

              </div>

              <div className="flex justify-between items-center text-sm">

                <div className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={() => setKeepLoggedIn(!keepLoggedIn)}
                    className="accent-[#000080]"
                  />

                  <label className="text-gray-600">
                    Keep me signed in
                  </label>

                </div>

                <Link
                  to="/forgot-password"
                  className="text-[#000080] font-medium hover:underline"
                >
                  Forgot Password?
                </Link>

              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#000080] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition"
              >
                Login
              </button>

              <div className="text-center text-sm text-gray-600">

                New User?{" "}

                <Link
                  to="/register"
                  className="text-[#000080] font-semibold hover:underline"
                >
                  Register
                </Link>

              </div>

            </form>

          </div>

        </div>

      </div>
    </>
  )
}

export default Login