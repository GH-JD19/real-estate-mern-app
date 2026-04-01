import { NavLink } from "react-router-dom"
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"
import toast from "react-hot-toast"

function Footer() {

  const { user } = useAuth()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const linkClass =
    "block text-sm hover:text-blue-600 hover:translate-x-1 hover:font-medium transition-all duration-200";

  // ✅ Subscribe Handler (Backend Connected)
  const handleSubscribe = async () => {
    if (!email) {
      return toast.error("Please enter email")
    }

    try {
      setLoading(true)

      const res = await fetch("http://localhost:5000/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      toast.success("Subscribed successfully 🎉")
      setEmail("")

    } catch (error) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="bg-blue-600 text-white rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div>
            <h3 className="text-lg font-semibold">
              Subscribe to our newsletter
            </h3>
            <p className="text-sm text-blue-100">
              Get latest property updates and offers
            </p>
          </div>

          <div className="flex w-full md:w-auto shadow-md rounded-lg overflow-hidden">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 w-full md:w-64 text-black outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-black px-5 text-white text-sm hover:bg-gray-900 transition focus:ring-2 focus:ring-black active:scale-95"
            >
              {loading ? "..." : "Subscribe"}
            </button>
          </div>

        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 mt-12"></div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-3">

        {/* BRAND */}
        <div>
          <h2 className="text-3xl font-extrabold text-blue-600 mb-4 tracking-tight">
            RealEstate
          </h2>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm text-sm">
            Discover your dream property easily and securely.
            Buy, rent and explore verified listings with confidence.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>

          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
            Quick Links
          </h3>

          <ul className="space-y-3 text-gray-600 dark:text-gray-400">

            {!user && (
              <>
                <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
                <li><NavLink to="/about" className={linkClass}>About</NavLink></li>
                <li><NavLink to="/terms" className={linkClass}>Terms</NavLink></li>
                <li><NavLink to="/privacy" className={linkClass}>Privacy</NavLink></li>
                <li><NavLink to="/login" className={linkClass}>Login</NavLink></li>
                <li><NavLink to="/register" className={linkClass}>Register</NavLink></li>
              </>
            )}

            {user?.role === "user" && (
              <>
                <li><NavLink to="/user-dashboard" className={linkClass}>Dashboard</NavLink></li>
                <li><NavLink to="/user/saved" className={linkClass}>Wishlist</NavLink></li>
                <li><NavLink to="/user/bookings" className={linkClass}>My Visits</NavLink></li>
                <li><NavLink to="/user/profile" className={linkClass}>Profile</NavLink></li>
              </>
            )}

            {user?.role === "agent" && (
              <>
                <li><NavLink to="/agent-dashboard" className={linkClass}>Dashboard</NavLink></li>
                <li><NavLink to="/agent/manage-properties" className={linkClass}>Manage Properties</NavLink></li>
                <li><NavLink to="/agent/bookings" className={linkClass}>Bookings</NavLink></li>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <li><NavLink to="/admin-dashboard" className={linkClass}>Dashboard</NavLink></li>
                <li><NavLink to="/admin/properties" className={linkClass}>Properties</NavLink></li>
                <li><NavLink to="/admin/users" className={linkClass}>Users</NavLink></li>
                <li><NavLink to="/admin/analytics" className={linkClass}>Analytics</NavLink></li>
              </>
            )}

          </ul>

        </div>

        {/* CONTACT */}
        <div>

          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
            Contact
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            support@realestate.com
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            +91 99999 12345
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex gap-4 mt-6">

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-2.5 cursor-pointer rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:scale-110 hover:border-blue-600 transition-all duration-300"
            >
              <FaFacebookF size={14} />
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2.5 cursor-pointer rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:scale-110 hover:border-blue-600 transition-all duration-300"
            >
              <FaInstagram size={14} />
            </a>

            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="p-2.5 cursor-pointer rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:scale-110 hover:border-blue-600 transition-all duration-300"
            >
              <FaTwitter size={14} />
            </a>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2.5 cursor-pointer rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:scale-110 hover:border-blue-600 transition-all duration-300"
            >
              <FaLinkedinIn size={14} />
            </a>

          </div>

        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-5 text-center text-gray-500 text-xs tracking-wide">
        © {new Date().getFullYear()} RealEstate. All rights reserved.
      </div>

    </footer>
  )
}

export default Footer