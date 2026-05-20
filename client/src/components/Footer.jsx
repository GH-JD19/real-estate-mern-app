import React, { useState, useCallback, useMemo } from "react"
import { NavLink } from "react-router-dom"
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

function Footer() {
  const { user } = useAuth()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  // ✅ API Base URL (Production Ready)
  const API_URL = import.meta.env.VITE_API_URL || "https://real-estate-mern-app-98vu.onrender.com"

  const linkClass =
    "block text-sm hover:text-blue-600 hover:translate-x-1 hover:font-medium transition-all duration-200"

  // ✅ Email validation
  const isValidEmail = useCallback((email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }, [])

  // ✅ Subscribe Handler
  const handleSubscribe = useCallback(async () => {
    if (!email.trim()) {
      return toast.error("Please enter your email")
    }

    if (!isValidEmail(email)) {
      return toast.error("Please enter a valid email")
    }

    try {
      setLoading(true)

      const res = await fetch(`${API_URL}/api/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.message || "Subscription failed")
      }

      toast.success("Subscribed successfully 🎉")
      setEmail("")
    } catch (error) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [email, API_URL, isValidEmail])

  // ✅ Handle Enter key submit
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSubscribe()
      }
    },
    [handleSubscribe]
  )

  // ✅ Role-based links (scalable & clean)
  const links = useMemo(() => {
    if (!user) {
      return [
        { to: "/", label: "Home" },
        { to: "/about", label: "About" },
        { to: "/terms", label: "Terms" },
        { to: "/privacy", label: "Privacy" },
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
      ]
    }

    if (user.role === "user") {
      return [
        { to: "/user-dashboard", label: "Dashboard" },
        { to: "/user/saved", label: "Wishlist" },
        { to: "/user/bookings", label: "My Visits" },
        //{ to: "/user/profile", label: "Profile" },
      ]
    }

    if (user.role === "agent") {
      return [
        { to: "/agent-dashboard", label: "Dashboard" },
        { to: "/agent/manage-properties", label: "Manage Properties" },
        { to: "/agent/bookings", label: "Bookings" },
      ]
    }

    if (user.role === "admin") {
      return [
        { to: "/admin-dashboard", label: "Dashboard" },
        { to: "/admin/properties", label: "Properties" },
        { to: "/admin/users", label: "Users" },
        { to: "/admin/analytics", label: "Analytics" },
      ]
    }

    return []
  }, [user])

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">

      {/* NEWSLETTER */}
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
              aria-label="Email address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="px-4 py-2 w-full md:w-64 text-black outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
            />

            <button
              onClick={handleSubscribe}
              disabled={loading}
              aria-busy={loading}
              className="bg-black px-5 text-white text-sm hover:bg-gray-900 transition focus:ring-2 focus:ring-black active:scale-95 disabled:opacity-70 flex items-center justify-center min-w-[100px]"
            >
              {loading ? (
                <span className="animate-pulse">Sending...</span>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-100 dark:border-gray-800 mt-12"></div>

      {/* MAIN FOOTER */}
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

        {/* LINKS */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
            Quick Links
          </h3>

          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
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

          {/* SOCIAL */}
          <div className="flex gap-4 mt-6">
            {[
              { href: "https://www.facebook.com/", icon: <FaFacebookF size={14} />, label: "Facebook" },
              { href: "https://www.instagram.com/", icon: <FaInstagram size={14} />, label: "Instagram" },
              { href: "https://twitter.com/", icon: <FaTwitter size={14} />, label: "Twitter" },
              { href: "https://www.linkedin.com/", icon: <FaLinkedinIn size={14} />, label: "LinkedIn" },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:scale-110 hover:border-blue-600 transition-all duration-300"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-5 text-center text-gray-500 text-xs tracking-wide">
        © {new Date().getFullYear()} RealEstate. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer