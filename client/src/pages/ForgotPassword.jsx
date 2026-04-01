import { useState } from "react"
import { Link } from "react-router-dom"
import { FiMail } from "react-icons/fi"
import api from "../services/api"
import toast from "react-hot-toast"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [emailValid, setEmailValid] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

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

    validateEmail(email)

    if (!email || emailValid === false) {
      toast.error("Please enter a valid email")
      return
    }

    try {
      setLoading(true)
      setServerError("")

      await toast.promise(
        api.post("/auth/forgot-password", { email }),
        {
          loading: "Sending reset link...",
          success: "Reset link sent successfully 📩",
          error: (err) =>
            err.response?.data?.message ||
            "Something went wrong. Please try again.",
        }
      )

      setSubmitted(true)

    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again."

      setServerError(message) // inline fallback
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
            Reset Password 🔐
          </h2>

          <p className="text-lg opacity-90 z-10">
            Enter your registered email and we'll send you a secure reset link.
          </p>

        </div>

        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12">

          {!submitted ? (
            <>
              <h2 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
                Forgot Password
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Enter your email to receive a password reset link
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
                      placeholder="Enter your registered email"
                    />
                  </div>

                  {emailError && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      ⚠️ {emailError}
                    </p>
                  )}
                </div>

                {/* SERVER ERROR */}
                {serverError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    ⚠️ {serverError}
                  </p>
                )}

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading || !emailValid}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  Send Reset Link
                </button>

                {/* LOGIN LINK */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Login
                  </Link>
                </div>

              </form>
            </>
          ) : (
            <div className="text-center space-y-4">

              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">
                ✓
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Check Your Email 📩
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                A password reset link has been sent to your email address.
              </p>

              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                Back to Login
              </Link>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default ForgotPassword