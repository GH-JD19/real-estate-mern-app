import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { FiMail } from "react-icons/fi"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

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

    if (!email || emailValid === false) {
      toast.error("Please enter a valid email")
      return
    }

    if (!password) {
      toast.error("Password is required")
      return
    }

    try {
      setLoading(true)

      const { data } = await toast.promise(
        api.post("/auth/login", {
          email,
          password,
        }),
        {
          loading: "Signing you in...",
          success: "Login successful 🎉",
          error: (err) =>
            err.response?.data?.message || "Login failed",
        }
      )

      const { accessToken, refreshToken, user } = data

      login(user, accessToken, refreshToken, keepLoggedIn)

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
      const message = err.response?.data?.message || "Login failed"
      setError(message) // inline error backup
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex-col justify-center p-10 space-y-6">

          <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-[-50px] left-[-50px]" />

          <h2 className="text-3xl font-bold z-10">
            Welcome Back 👋
          </h2>

          <p className="text-lg opacity-90 z-10">
            Login to manage your properties, track listings and explore opportunities.
          </p>

        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12">

          <h2 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
            Login to your account
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Welcome back! Please enter your details
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Email
              </label>

              <div className="relative">
                <FiMail className="absolute left-3 top-[50%] -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />

                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value.trim().toLowerCase()
                    setEmail(value)
                    validateEmail(value)
                  }}
                  className={`w-full mt-1 pl-10 pr-3 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition shadow-sm dark:bg-gray-900
                    ${emailValid === false ? "border-red-500" : ""}
                    ${emailValid === true ? "border-green-500" : ""}
                  `}
                  placeholder="Enter your email"
                />
              </div>

              {emailError && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  ⚠️ {emailError}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 pl-3 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-500 outline-none dark:bg-gray-900 shadow-sm"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="flex justify-between items-center text-sm">

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={() => setKeepLoggedIn(!keepLoggedIn)}
                  className="accent-blue-600"
                />
                <label className="text-gray-600 dark:text-gray-300">
                  Keep me signed in
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-blue-600 font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* INLINE ERROR */}
            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                ⚠️ {error}
              </p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading || !emailValid || !password}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60"
            >
              Login
            </button>

            {/* REGISTER */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              New User?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Register
              </Link>
            </div>

          </form>

        </div>

      </div>

    </div>
  )
}

export default Login