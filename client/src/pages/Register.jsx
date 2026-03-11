import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"

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
    role: "USER"
  })

  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [emailValid, setEmailValid] = useState(null)
  const [passwordStrength, setPasswordStrength] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordMatchError, setPasswordMatchError] = useState("")

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

  const validatePhone = (value) => {
    if (value.length !== 10) {
      setPhoneError("Mobile number must be 10 digits")
      return false
    }
    setPhoneError("")
    return true
  }

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return setPasswordStrength("Weak")
    if (/[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8)
      return setPasswordStrength("Strong")
    return setPasswordStrength("Medium")
  }

  const checkPasswordMatch = (password, confirmPassword) => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMatchError("Passwords do not match")
    } else {
      setPasswordMatchError("")
    }
  }

  const handleChange = (e) => {
    let { name, value } = e.target

    if (name === "name" || name === "address") value = value.toUpperCase()

    if (name === "email") {
      value = value.toLowerCase()
      validateEmail(value)
    }

    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10)
      validatePhone(value)
    }

    if (name === "role") value = value.toUpperCase()

    const updatedForm = { ...form, [name]: value }
    setForm(updatedForm)

    if (name === "password") checkPasswordStrength(value)

    if (name === "password" || name === "confirmPassword") {
      checkPasswordMatch(
        name === "password" ? value : updatedForm.password,
        name === "confirmPassword" ? value : updatedForm.confirmPassword
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.email || emailValid === false)
      return setError("Enter a valid email")

    if (!validatePhone(form.phone))
      return

    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match")

    try {
      setLoading(true)

      const payload = {
        ...form,
        role: form.role.toLowerCase()
      }

      const { data } = await api.post("/auth/register", payload)

      login(data.user, data.token, true)

      if (data.user.role === "admin") navigate("/admin-dashboard")
      else if (data.user.role === "agent") navigate("/agent-dashboard")
      else navigate("/user-dashboard")

    } catch (err) {
      const message = err.response?.data?.message || ""

      if (message.includes("email")) setError("Email already registered")
      else if (message.includes("phone")) setError("Mobile number already registered")
      else setError(message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const strengthColor = {
    Weak: "text-red-500",
    Medium: "text-yellow-500",
    Strong: "text-green-500"
  }

  return (
    <>
      {/* PREMIUM FULLSCREEN LOADER */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 px-10 py-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#000080] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-gray-700">Creating your account...</p>
          </div>
        </div>
      )}

      <div className="min-h-[80vh] flex items-center justify-center bg-[#f4f6fb] px-4 py-12">

        <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

          <div className="hidden md:flex bg-[#000080] text-white flex-col justify-center p-10">
            <h2 className="text-3xl font-bold mb-4">Join Us 🚀</h2>
            <p className="text-lg opacity-90">
              Create your account and start exploring properties today.
            </p>
          </div>

          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
              Create your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="text-sm text-gray-600">Register As</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full mt-1 p-3 border rounded-lg">
                  <option value="USER">USER</option>
                  <option value="AGENT">AGENT</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <input name="name" required value={form.name} onChange={handleChange}
                  className="w-full mt-1 p-3 border rounded-lg" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Address</label>
                <input name="address" required value={form.address} onChange={handleChange}
                  className="w-full mt-1 p-3 border rounded-lg" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input name="email" required value={form.email} onChange={handleChange}
                  className="w-full mt-1 p-3 border rounded-lg" />
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-600">Mobile</label>
                <input name="phone" required value={form.phone} onChange={handleChange}
                  className="w-full mt-1 p-3 border rounded-lg" />
                {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-600">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-4 text-gray-500"
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

              <div>
                <label className="text-sm text-gray-600">Confirm Password</label>
                <input name="confirmPassword" type="password" required
                  value={form.confirmPassword} onChange={handleChange}
                  className="w-full mt-1 p-3 border rounded-lg" />
                {passwordMatchError && (
                  <p className="text-sm text-red-500">{passwordMatchError}</p>
                )}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button type="submit"
                className="w-full bg-[#000080] text-white py-3 rounded-lg font-semibold hover:bg-blue-900 transition">
                Register
              </button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-[#000080] font-semibold hover:underline">
                  Login
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register