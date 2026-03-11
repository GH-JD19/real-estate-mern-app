import { NavLink } from "react-router-dom"
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"

function Footer() {

  const { user } = useAuth()

  return (
    <footer className="bg-[#000080] dark:bg-gray-900 text-white transition-all duration-300">

      {/* Top Section */}
      <div className="container mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold mb-3">
            RealEstate
          </h2>
          <p className="text-sm text-gray-300 dark:text-gray-400 leading-relaxed">
            Find your dream property easily and securely.
            Buy, rent, and explore properties with confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">
            Quick Links
          </h3>

          <ul className="space-y-2 text-sm">

            {/* GUEST */}
            {!user && (
              <>
                <li><NavLink to="/" className="hover:text-[#4DA8FF]">Home</NavLink></li>
                <li><NavLink to="/about" className="hover:text-[#4DA8FF]">About</NavLink></li>
                <li><NavLink to="/terms" className="hover:text-[#4DA8FF]">Terms & Conditions</NavLink></li>
                <li><NavLink to="/privacy" className="hover:text-[#4DA8FF]">Privacy Policy</NavLink></li>
                <li><NavLink to="/login" className="hover:text-[#4DA8FF]">Login</NavLink></li>
                <li><NavLink to="/register" className="hover:text-[#4DA8FF]">Register</NavLink></li>
              </>
            )}

            {/* USER */}
            {user?.role === "user" && (
              <>
                <li><NavLink to="/user-dashboard" className="hover:text-[#4DA8FF]">Dashboard</NavLink></li>
                <li><NavLink to="/user/my-properties" className="hover:text-[#4DA8FF]">My Properties</NavLink></li>
                <li><NavLink to="/user/saved" className="hover:text-[#4DA8FF]">Wishlist</NavLink></li>
                <li><NavLink to="/user/bookings" className="hover:text-[#4DA8FF]">My Visits</NavLink></li>
                <li><NavLink to="/user/profile" className="hover:text-[#4DA8FF]">Profile</NavLink></li>
              </>
            )}

            {/* AGENT */}
            {user?.role === "agent" && (
              <>
                <li><NavLink to="/agent-dashboard" className="hover:text-[#4DA8FF]">Dashboard</NavLink></li>
                <li><NavLink to="/agent/properties" className="hover:text-[#4DA8FF]">Manage Properties</NavLink></li>
                <li><NavLink to="/agent/bookings" className="hover:text-[#4DA8FF]">Bookings</NavLink></li>
              </>
            )}

            {/* ADMIN */}
            {user?.role === "admin" && (
              <>
                <li><NavLink to="/admin-dashboard" className="hover:text-[#4DA8FF]">Dashboard</NavLink></li>
                <li><NavLink to="/admin/properties" className="hover:text-[#4DA8FF]">Properties</NavLink></li>
                <li><NavLink to="/admin/users" className="hover:text-[#4DA8FF]">Users</NavLink></li>
                <li><NavLink to="/admin/analytics" className="hover:text-[#4DA8FF]">Analytics</NavLink></li>
              </>
            )}

          </ul>
        </div>

        {/* Contact + Social */}
        <div>
          <h3 className="font-semibold mb-3">
            Contact
          </h3>
          <p className="text-sm text-gray-300 dark:text-gray-400">
            support@realestate.com
          </p>
          <p className="text-sm mt-2 text-gray-300 dark:text-gray-400">
            +91 9876543210
          </p>

          <div className="flex gap-4 mt-4 text-lg">
            <a href="#" className="hover:text-[#4DA8FF] transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-[#4DA8FF] transition"><FaInstagram /></a>
            <a href="#" className="hover:text-[#4DA8FF] transition"><FaTwitter /></a>
            <a href="#" className="hover:text-[#4DA8FF] transition"><FaLinkedinIn /></a>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-blue-900 dark:border-gray-700 text-center text-sm py-4 bg-[#000066] dark:bg-gray-800">
        © {new Date().getFullYear()} RealEstate. All rights reserved.
      </div>

    </footer>
  )
}

export default Footer