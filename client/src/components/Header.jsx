import { useState, useRef, useEffect, useCallback } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useNotification } from "../context/NotificationContext"

import {
  FaHome, FaInfoCircle, FaFileContract, FaShieldAlt,
  FaSignInAlt, FaUserPlus, FaBuilding, FaUsers,
  FaChartLine, FaHeart, FaCalendarCheck, FaUser,
  FaBars, FaTimes, FaMoon, FaSun, FaKey, FaCog, FaBell,
  FaCheckCircle, FaTimesCircle
} from "react-icons/fa"

// ✅ Role constants
const ROLES = {
  ADMIN: "admin",
  AGENT: "agent",
  USER: "user"
}

function Header() {

  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const {
    notifications,
    unread,
    setUnread,
    markAsRead,
    markAllAsRead
  } = useNotification()

  const [showNotifications, setShowNotifications] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const dropdownRef = useRef()
  const notificationRef = useRef()

  // ================= ICON HELPER =================
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case "PROPERTY_CREATED":
        return <FaHome className="text-blue-500" />
      case "PROPERTY_APPROVED":
        return <FaCheckCircle className="text-green-500" />
      case "PROPERTY_REJECTED":
        return <FaTimesCircle className="text-red-500" />
      case "BOOKING_CREATED":
        return <FaCalendarCheck className="text-purple-500" />
      default:
        return <FaBell />
    }
  }, [])

  // ================= CLICK HANDLER =================
  const handleNotificationClick = useCallback((n) => {

    if (n.type === "BOOKING_CREATED") navigate("/agent/bookings")
    if (n.type === "PROPERTY_CREATED") navigate("/admin/pending-properties")
    if (n.type === "PROPERTY_APPROVED") navigate("/user-dashboard")
    if (n.type === "PROPERTY_REJECTED") navigate("/user-dashboard")

    setShowNotifications(false)
  }, [navigate])

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handler = (e) => {

      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSettingsOpen(false)
      }

      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false)
      }

    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
    setMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (user?.role === ROLES.ADMIN) return "/admin-dashboard"
    if (user?.role === ROLES.AGENT) return "/agent-dashboard"
    return "/user-dashboard"
  }

  const linkClass =
    "flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"

  const activeClass =
    "flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400"

  // ✅ Reusable NavItem
  const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        isActive ? activeClass : linkClass
      }
    >
      <Icon /> {label}
    </NavLink>
  )

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >

      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* LOGO */}
        <NavLink
          to={user ? getDashboardLink() : "/"}
          className="text-2xl font-bold tracking-tight text-blue-600 hover:opacity-90 transition"
        >
          RealEstate
        </NavLink>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8">

          {/* THEME */}
          <button
            aria-label="Toggle Theme"
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:scale-105 transition"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* 🔔 NOTIFICATION */}
          {user && (
            <div className="relative" ref={notificationRef}>
              <button
                aria-label="Notifications"
                onClick={() => {
                  setShowNotifications(prev => !prev)
                  setUnread(0)
                }}
                className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:scale-105 transition"
              >
                <FaBell />

                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">

                  <div className="p-3 border-b dark:border-gray-700 font-semibold flex justify-between">
                    Notifications
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          handleNotificationClick(n)
                          if (n._id && !n.read) markAsRead(n._id)
                        }}
                        className={`flex gap-3 px-4 py-3 border-b cursor-pointer transition
                        ${!n.read ? "bg-blue-50 dark:bg-gray-700" : ""}`}
                      >

                        <div className="mt-1">
                          {getNotificationIcon(n.type)}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {n.message}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.time).toLocaleString()}
                          </p>
                        </div>

                      </div>
                    ))
                  )}

                </div>
              )}
            </div>
          )}

          {/* PUBLIC */}
          {!user && (
            <>
              <NavItem to="/" icon={FaHome} label="Home" />
              <NavItem to="/about" icon={FaInfoCircle} label="About" />
              <NavItem to="/terms" icon={FaFileContract} label="Terms" />
              <NavItem to="/privacy" icon={FaShieldAlt} label="Privacy" />
              <NavItem to="/login" icon={FaSignInAlt} label="Login" />

              <NavLink
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
              >
                <FaUserPlus /> Register
              </NavLink>
            </>
          )}

          {/* AUTH */}
          {user && (
            <>
              <NavItem to={getDashboardLink()} icon={FaHome} label="Dashboard" />

              {user.role === ROLES.ADMIN && (
                <>
                  <NavItem to="/admin/properties" icon={FaBuilding} label="Properties" />
                  <NavItem to="/admin/users" icon={FaUsers} label="Users" />
                  <NavItem to="/admin/analytics" icon={FaChartLine} label="Analytics" />
                </>
              )}

              {user.role === ROLES.AGENT && (
                <>
                  <NavItem to="/agent/manage-properties" icon={FaBuilding} label="Manage Property" />
                  <NavItem to="/agent/bookings" icon={FaCalendarCheck} label="Bookings" />
                </>
              )}

              {user.role === ROLES.USER && (
                <>
                  <NavItem to="/user/saved" icon={FaHeart} label="Wishlist" />
                  <NavItem to="/user/bookings" icon={FaCalendarCheck} label="My Visits" />
                </>
              )}

              {/* SETTINGS */}
              <div className="relative" ref={dropdownRef}>
                <button
                  aria-label="Settings"
                  onClick={() => setSettingsOpen(prev => !prev)}
                  className={`${linkClass} px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${settingsOpen ? "text-blue-600 dark:text-blue-400" : ""}`}
                >
                  <FaCog /> Settings
                </button>

                {settingsOpen && (
  <div className="
    absolute right-0 mt-3 w-56
    bg-white/70 dark:bg-gray-900/70
    backdrop-blur-xl
    border border-gray-200/50 dark:border-gray-700/50
    rounded-2xl
    shadow-2xl
    overflow-hidden
    transition-all duration-200
  ">

    <NavLink
      to={`/${user.role}/profile`}
      onClick={() => setSettingsOpen(false)}
      className="flex items-center gap-3 px-4 py-3 text-sm
      hover:bg-blue-50 dark:hover:bg-gray-800
      transition-all duration-200 group"
    >
      <FaUser className="text-gray-500 group-hover:text-blue-500 transition" />
      <span className="group-hover:translate-x-1 transition">
        Profile
      </span>
    </NavLink>

    <NavLink
      to={`/${user.role}/change-password`}
      onClick={() => setSettingsOpen(false)}
      className="flex items-center gap-3 px-4 py-3 text-sm
      hover:bg-blue-50 dark:hover:bg-gray-800
      transition-all duration-200 group"
    >
      <FaKey className="text-gray-500 group-hover:text-blue-500 transition" />
      <span className="group-hover:translate-x-1 transition">
        Change Password
      </span>
    </NavLink>

  </div>
)}
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 hover:scale-[1.02] transition shadow-sm"
              >
                Logout
              </button>
            </>
          )}

        </nav>

        {/* MOBILE TOGGLE */}
        <button
          aria-label="Toggle Menu"
          className="md:hidden text-2xl text-gray-700 dark:text-gray-300"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 h-screen w-screen overflow-y-auto bg-white dark:bg-gray-900 transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">

          <h2 className="text-xl font-bold text-blue-600">
            RealEstate
          </h2>

          <button onClick={() => setMenuOpen(false)}>
            <FaTimes size={22} />
          </button>

        </div>

        <div className="p-6 space-y-5">

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-lg"
          >
            {darkMode ? <FaSun /> : <FaMoon />} Toggle Theme
          </button>

          {user && (
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <p className="font-semibold mb-2">Notifications ({unread})</p>

              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No notifications</p>
              ) : (
                notifications.slice(0,5).map((n,i)=>(
                  <p key={i} className="text-sm mb-1">{n.message}</p>
                ))
              )}
            </div>
          )}

          {!user && (
            <>
              <NavItem to="/" icon={FaHome} label="Home" onClick={()=>setMenuOpen(false)} />
              <NavItem to="/about" icon={FaInfoCircle} label="About" onClick={()=>setMenuOpen(false)} />
              <NavItem to="/terms" icon={FaFileContract} label="Terms" onClick={()=>setMenuOpen(false)} />
              <NavItem to="/privacy" icon={FaShieldAlt} label="Privacy" onClick={()=>setMenuOpen(false)} />
              <NavItem to="/login" icon={FaSignInAlt} label="Login" onClick={()=>setMenuOpen(false)} />
              <NavItem to="/register" icon={FaUserPlus} label="Register" onClick={()=>setMenuOpen(false)} />
            </>
          )}

          {user && (
            <>
              <NavItem to={getDashboardLink()} icon={FaHome} label="Dashboard" onClick={()=>setMenuOpen(false)} />

              <NavItem to={`/${user.role}/profile`} icon={FaUser} label="Profile" onClick={()=>setMenuOpen(false)} />
              <NavItem to={`/${user.role}/change-password`} icon={FaKey} label="Change Password" onClick={()=>setMenuOpen(false)} />

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg w-full transition"
              >
                Logout
              </button>
            </>
          )}

        </div>

      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

    </header>
  )
}

export default Header