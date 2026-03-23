import { NavLink } from "react-router-dom"
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"

function Footer() {

  const { user } = useAuth()

  const linkClass =
    "hover:text-blue-600 transition-colors duration-200"

  return (
    <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-700">

      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-3">

        {/* BRAND */}
        <div>

          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            RealEstate
          </h2>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
            Discover your dream property easily and securely.
            Buy, rent and explore verified listings with confidence.
          </p>

        </div>

        {/* QUICK LINKS */}
        <div>

          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            Quick Links
          </h3>

          <ul className="space-y-2 text-gray-600 dark:text-gray-400">

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

          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            Contact
          </h3>

          <p className="text-gray-600 dark:text-gray-400">
            support@realestate.com
          </p>

          <p className="text-gray-600 dark:text-gray-400 mt-2">
            +91 9876543210
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex gap-3 mt-5 text-gray-600 dark:text-gray-400">

            <a
              href="#"
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition duration-200"
            >
              <FaFacebookF size={14} />
            </a>

            <a
              href="#"
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition duration-200"
            >
              <FaInstagram size={14} />
            </a>

            <a
              href="#"
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition duration-200"
            >
              <FaTwitter size={14} />
            </a>

            <a
              href="#"
              className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition duration-200"
            >
              <FaLinkedinIn size={14} />
            </a>

          </div>

        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t dark:border-gray-700 py-4 text-center text-gray-500 text-sm">

        © {new Date().getFullYear()} RealEstate. All rights reserved.

      </div>

    </footer>
  )
}

export default Footer