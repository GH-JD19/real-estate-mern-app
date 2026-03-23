import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"

import {
  FaHome, FaInfoCircle, FaFileContract, FaShieldAlt,
  FaSignInAlt, FaUserPlus, FaBuilding, FaUsers,
  FaChartLine, FaHeart, FaCalendarCheck, FaUser,
  FaBars, FaTimes, FaMoon, FaSun, FaKey, FaCog
} from "react-icons/fa"

function Header() {

  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

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
    "flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"

  const activeClass =
    "flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold"

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <NavLink
          to={user ? getDashboardLink() : "/"}
          className="text-2xl font-bold text-blue-600"
        >
          RealEstate
        </NavLink>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-6">

          {/* THEME */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {!user && (
            <>
              <NavLink to="/" className={({isActive}) => isActive ? activeClass : linkClass}><FaHome /> Home</NavLink>
              <NavLink to="/about" className={({isActive}) => isActive ? activeClass : linkClass}><FaInfoCircle /> About</NavLink>
              <NavLink to="/terms" className={({isActive}) => isActive ? activeClass : linkClass}><FaFileContract /> Terms</NavLink>
              <NavLink to="/privacy" className={({isActive}) => isActive ? activeClass : linkClass}><FaShieldAlt /> Privacy</NavLink>
              <NavLink to="/login" className={({isActive}) => isActive ? activeClass : linkClass}><FaSignInAlt /> Login</NavLink>
              <NavLink to="/register" className={({isActive}) => isActive ? activeClass : linkClass}><FaUserPlus /> Register</NavLink>
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

              <div className="relative">

                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={`${linkClass} ${settingsOpen ? "text-blue-600 dark:text-blue-400 font-semibold" : ""}`}
                >
                  <FaCog /> Settings
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 mt-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg w-48 border border-gray-200 dark:border-gray-700">

                    <NavLink
                      to={`/${user.role}/profile`}
                      onClick={() => setSettingsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaUser /> Profile
                    </NavLink>

                    <NavLink
                      to={`/${user.role}/change-password`}
                      onClick={() => setSettingsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaKey /> Change Password
                    </NavLink>

                  </div>
                )}

              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
        className={`fixed inset-0 h-screen w-screen overflow-y-auto bg-white dark:bg-black text-gray-700 dark:text-gray-300 dark:text-white shadow-xl transform transition-transform duration-300 z-50
        ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">

          <h2 className="text-xl font-bold text-blue-600">
            RealEstate
          </h2>

          <button onClick={() => setMenuOpen(false)}>
            <FaTimes size={22} />
          </button>

        </div>

        <div className="px-6 py-6 space-y-6">

          {/* MOBILE THEME TOGGLE - ALWAYS VISIBLE */}
          <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-white bg-gray-800 px-4 py-2 rounded-lg w-full"
              >
                {darkMode ? <FaSun /> : <FaMoon />} Toggle Theme
          </button>
          
          {!user && (
            <>
              <NavLink to="/" onClick={()=>setMenuOpen(false)} className={linkClass}><FaHome /> Home</NavLink>
              <NavLink to="/about" onClick={()=>setMenuOpen(false)} className={linkClass}><FaInfoCircle /> About</NavLink>
              <NavLink to="/terms" onClick={()=>setMenuOpen(false)} className={linkClass}><FaFileContract /> Terms</NavLink>
              <NavLink to="/privacy" onClick={()=>setMenuOpen(false)} className={linkClass}><FaShieldAlt /> Privacy</NavLink>
              <NavLink to="/login" onClick={()=>setMenuOpen(false)} className={linkClass}><FaSignInAlt /> Login</NavLink>
              <NavLink to="/register" onClick={()=>setMenuOpen(false)} className={linkClass}><FaUserPlus /> Register</NavLink>
            </>
          )}

          {user && (
            <>
              <NavLink to={getDashboardLink()} onClick={()=>setMenuOpen(false)} className={linkClass}>
                <FaHome /> Dashboard
              </NavLink>

              {user.role === "admin" && (
                <>
                  <NavLink to="/admin/properties" onClick={()=>setMenuOpen(false)} className={linkClass}>
                    <FaBuilding /> Properties
                  </NavLink>

                  <NavLink to="/admin/users" onClick={()=>setMenuOpen(false)} className={linkClass}>
                    <FaUsers /> Users
                  </NavLink>

                  <NavLink to="/admin/analytics" onClick={()=>setMenuOpen(false)} className={linkClass}>
                    <FaChartLine /> Analytics
                  </NavLink>
                </>
              )}

              {user.role === "agent" && (
                <>
                  <NavLink to="/agent/manage-properties" onClick={()=>setMenuOpen(false)} className={linkClass}>
                    <FaBuilding /> Manage Property
                  </NavLink>

                  <NavLink to="/agent/bookings" onClick={()=>setMenuOpen(false)} className={linkClass}>
                    <FaCalendarCheck /> Bookings
                  </NavLink>
                </>
              )}

              {user.role === "user" && (
                <>
                  <NavLink to="/user/saved" onClick={()=>setMenuOpen(false)} className={linkClass}>
                    <FaHeart /> Wishlist
                  </NavLink>

                  <NavLink to="/user/bookings" onClick={()=>setMenuOpen(false)} className={linkClass}>
                    <FaCalendarCheck /> My Visits
                  </NavLink>
                </>
              )}

              <NavLink to={`/${user.role}/profile`} onClick={()=>setMenuOpen(false)} className={linkClass}>
                <FaUser /> Profile
              </NavLink>

              <NavLink to={`/${user.role}/change-password`} onClick={()=>setMenuOpen(false)} className={linkClass}>
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