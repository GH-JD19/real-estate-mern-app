import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import api from "../services/api"
import toast from "react-hot-toast"

function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isFormValid =
    password &&
    confirmPassword &&
    password.length >= 6 &&
    password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      await toast.promise(
        api.put(`/auth/reset-password/${token}`, { password }),
        {
          loading: "Updating password...",
          success: "Password updated successfully ✅",
          error: (err) =>
            err.response?.data?.message || "Reset failed",
        }
      )

      setSuccess(true)

      setTimeout(() => {
        navigate("/login")
      }, 2500)

    } catch (err) {
      const message =
        err.response?.data?.message || "Reset failed"
      setError(message)
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
            Set New Password 🔐
          </h2>

          <p className="text-lg opacity-90 z-10">
            Enter a strong password to secure your account.
          </p>

        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12">

          {!success ? (
            <>
              <h2 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
                Reset Password
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Create a new secure password
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* PASSWORD */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-500 outline-none dark:bg-gray-900 shadow-sm"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-500 outline-none dark:bg-gray-900 shadow-sm"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
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
                  disabled={loading || !isFormValid}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Reset Password
                </button>

              </form>
            </>
          ) : (
            <div className="text-center space-y-4">

              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
                ✓
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Password Updated ✅
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                Your password has been successfully updated.
              </p>

              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                Go to Login
              </Link>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default ResetPassword