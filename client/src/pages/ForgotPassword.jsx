import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

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

    if (!email || emailValid === false) return

    try {

      setLoading(true)
      setServerError("")

      await api.post("/auth/forgot-password", { email })

      setSubmitted(true)

    } catch (error) {

      setServerError(
        error.response?.data?.message ||
        "Something went wrong. Please try again."
      )

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-blue-800 text-white flex-col justify-center p-6 md:p-10">

          <h2 className="text-3xl font-bold mb-4">
            Reset Password 🔐
          </h2>

          <p className="text-lg opacity-90">
            Enter your registered email and we'll send you a secure reset link.
          </p>

        </div>


        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12">

          {!submitted ? (

            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Forgot Password
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* EMAIL */}
                <div>

                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase()
                      setEmail(value)
                      validateEmail(value)
                    }}
                    className={`w-full mt-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition dark:bg-gray-900
                      ${emailValid === false ? "border-red-500" : ""}
                      ${emailValid === true ? "border-green-500" : ""}
                    `}
                    placeholder="Enter your registered email"
                  />

                  {emailError && (
                    <p className="text-sm text-red-500 mt-1">
                      {emailError}
                    </p>
                  )}

                </div>


                {/* SERVER ERROR */}
                {serverError && (
                  <p className="text-sm text-red-500">
                    {serverError}
                  </p>
                )}


                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {loading ? "Sending reset link..." : "Send Reset Link"}
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

            <div className="text-center">

              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                Check Your Email 📩
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-8">
                A password reset link has been sent to your email address.
              </p>

              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
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