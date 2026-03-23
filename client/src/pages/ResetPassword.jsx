import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import api from "../services/api"

function ResetPassword() {

  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e) => {

    e.preventDefault()
    setError("")

    if (password.length < 6) {
      return setError("Password must be at least 6 characters")
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match")
    }

    try {

      await api.put(`/auth/reset-password/${token}`, {
        password
      })

      setSuccess(true)

      setTimeout(() => {
        navigate("/login")
      }, 3000)

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Reset failed"
      )

    }

  }

  return (

    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex bg-gradient-to-br from-blue-600 to-blue-800 text-white flex-col justify-center p-6 md:p-10">

          <h2 className="text-3xl font-bold mb-4">
            Set New Password 🔐
          </h2>

          <p className="text-lg opacity-90">
            Enter a strong password to secure your account.
          </p>

        </div>


        {/* RIGHT PANEL */}
        <div className="p-8 md:p-12">

          {!success ? (

            <>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Reset Password
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* NEW PASSWORD */}
                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    required
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    className="w-full p-3 border rounded-lg pr-12 focus:ring-2 focus:ring-blue-600 outline-none dark:bg-gray-900"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                </div>


                {/* CONFIRM PASSWORD */}
                <div className="relative">

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    className="w-full p-3 border rounded-lg pr-12 focus:ring-2 focus:ring-blue-600 outline-none dark:bg-gray-900"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>

                </div>


                {error && (
                  <p className="text-red-500 text-sm">
                    {error}
                  </p>
                )}


                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Reset Password
                </button>

              </form>

            </>

          ) : (

            <div className="text-center">

              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                Password Updated ✅
              </h2>

              <p className="mb-8 text-gray-600 dark:text-gray-300">
                Your password has been successfully updated.
              </p>

              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
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