import { useState, useRef, useEffect } from "react"
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

function Header() {

  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const {
    notifications,
    unread,
    setUnread,
    setNotifications,
    markAsRead,
    markAllAsRead
  } = useNotification()

  const [showNotifications, setShowNotifications] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const dropdownRef = useRef()
  const notificationRef = useRef()

  // ================= ICON HELPER =================
  const getNotificationIcon = (type) => {
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
  }

  // ================= CLICK HANDLER =================
  const handleNotificationClick = (n) => {

    if (n.type === "BOOKING_CREATED") {
      navigate("/agent/bookings")
    }

    if (n.type === "PROPERTY_CREATED") {
      navigate("/admin/pending-properties")
    }

    if (n.type === "PROPERTY_APPROVED") {
      navigate("/user-dashboard")
    }

    if (n.type === "PROPERTY_REJECTED") {
      navigate("/user-dashboard")
    }

    setShowNotifications(false)
  }

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
    if (user?.role === "admin") return "/admin-dashboard"
    if (user?.role === "agent") return "/agent-dashboard"
    return "/user-dashboard"
  }

  const linkClass =
    "flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"

  const activeClass =
    "flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400"

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm border-b border-gray-200 dark:border-gray-700">

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
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:scale-105 transition"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* 🔔 NOTIFICATION */}
          {user && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
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
                        className={`flex gap-3 px-4 py-3 border-b cursor-pointer
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

          {!user && (
            <>
              <NavLink to="/" className={({isActive}) => isActive ? activeClass : linkClass}><FaHome /> Home</NavLink>
              <NavLink to="/about" className={({isActive}) => isActive ? activeClass : linkClass}><FaInfoCircle /> About</NavLink>
              <NavLink to="/terms" className={({isActive}) => isActive ? activeClass : linkClass}><FaFileContract /> Terms</NavLink>
              <NavLink to="/privacy" className={({isActive}) => isActive ? activeClass : linkClass}><FaShieldAlt /> Privacy</NavLink>
              <NavLink to="/login" className={({isActive}) => isActive ? activeClass : linkClass}><FaSignInAlt /> Login</NavLink>
              <NavLink to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"><FaUserPlus /> Register</NavLink>
            </>
          )}

          {user && (
            <>
              <NavLink to={getDashboardLink()} className={({isActive}) => isActive ? activeClass : linkClass}>
                <FaHome /> Dashboard
              </NavLink>

              {user.role === "admin" && (
                <>
                  <NavLink to="/admin/properties" className={({isActive}) => isActive ? activeClass : linkClass}>
                    <FaBuilding /> Properties
                  </NavLink>

                  <NavLink to="/admin/users" className={({isActive}) => isActive ? activeClass : linkClass}>
                    <FaUsers /> Users
                  </NavLink>

                  <NavLink to="/admin/analytics" className={({isActive}) => isActive ? activeClass : linkClass}>
                    <FaChartLine /> Analytics
                  </NavLink>
                </>
              )}

              {user.role === "agent" && (
                <>
                  <NavLink to="/agent/manage-properties" className={({isActive}) => isActive ? activeClass : linkClass}>
                    <FaBuilding /> Manage Property
                  </NavLink>

                  <NavLink to="/agent/bookings" className={({isActive}) => isActive ? activeClass : linkClass}>
                    <FaCalendarCheck /> Bookings
                  </NavLink>
                </>
              )}

              {user.role === "user" && (
                <>
                  <NavLink to="/user/saved" className={({isActive}) => isActive ? activeClass : linkClass}>
                    <FaHeart /> Wishlist
                  </NavLink>

                  <NavLink to="/user/bookings" className={({isActive}) => isActive ? activeClass : linkClass}>
                    <FaCalendarCheck /> My Visits
                  </NavLink>
                </>
              )}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={`${linkClass} px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${settingsOpen ? "text-blue-600 dark:text-blue-400" : ""}`}
                >
                  <FaCog /> Settings
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                    <NavLink
                      to={`/${user.role}/profile`}
                      onClick={() => setSettingsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <FaUser /> Profile
                    </NavLink>

                    <NavLink
                      to={`/${user.role}/change-password`}
                      onClick={() => setSettingsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <FaKey /> Change Password
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
          className="md:hidden text-2xl text-gray-700 dark:text-gray-300"
          onClick={() => setMenuOpen(!menuOpen)}
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

          {/* MOBILE NOTIFICATIONS */}
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
              <NavLink to="/" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}><FaHome /> Home</NavLink>
              <NavLink to="/about" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}><FaInfoCircle /> About</NavLink>
              <NavLink to="/terms" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}><FaFileContract /> Terms</NavLink>
              <NavLink to="/privacy" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}><FaShieldAlt /> Privacy</NavLink>
              <NavLink to="/login" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}><FaSignInAlt /> Login</NavLink>
              <NavLink to="/register" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}><FaUserPlus /> Register</NavLink>
            </>
          )}

          {user && (
            <>
              <NavLink to={getDashboardLink()} onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                <FaHome /> Dashboard
              </NavLink>

              {user.role === "admin" && (
                <>
                  <NavLink to="/admin/properties" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                    <FaBuilding /> Properties
                  </NavLink>

                  <NavLink to="/admin/users" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                    <FaUsers /> Users
                  </NavLink>

                  <NavLink to="/admin/analytics" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                    <FaChartLine /> Analytics
                  </NavLink>
                </>
              )}

              {user.role === "agent" && (
                <>
                  <NavLink to="/agent/manage-properties" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                    <FaBuilding /> Manage Property
                  </NavLink>

                  <NavLink to="/agent/bookings" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                    <FaCalendarCheck /> Bookings
                  </NavLink>
                </>
              )}

              {user.role === "user" && (
                <>
                  <NavLink to="/user/saved" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                    <FaHeart /> Wishlist
                  </NavLink>

                  <NavLink to="/user/bookings" onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                    <FaCalendarCheck /> My Visits
                  </NavLink>
                </>
              )}

              <NavLink to={`/${user.role}/profile`} onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                <FaUser /> Profile
              </NavLink>

              <NavLink to={`/${user.role}/change-password`} onClick={()=>setMenuOpen(false)} className={`${linkClass} transition`}>
                <FaKey /> Change Password
              </NavLink>

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