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

  const linkClass = "flex items-center gap-2 hover:text-[#4DA8FF]"
  const activeClass = "flex items-center gap-2 text-[#4DA8FF] font-semibold"

  return (
    <header className="bg-[#000080] dark:bg-gray-900 text-white shadow-lg sticky top-0 z-50">

      <div className="container mx-auto px-6 py-4 flex justify-between items-center">

        <NavLink to={user ? getDashboardLink() : "/"} className="text-2xl font-bold">
          RealEstate
        </NavLink>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-6">

          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-3 py-1 rounded"
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

              {/* ADMIN */}
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

              {/* AGENT */}
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

              {/* USER */}
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

              {/* SETTINGS */}
              <div className="relative">

                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="flex items-center gap-2 hover:text-[#4DA8FF]"
                >
                  <FaCog /> Settings
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 mt-2 bg-blue-900 text-white rounded shadow-lg w-48 border border-blue-700">

                    <NavLink
                      to={`/${user.role}/profile`}
                      onClick={() => setSettingsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700"
                    >
                      <FaUser /> Profile
                    </NavLink>

                    <NavLink
                      to={`/${user.role}/change-password`}
                      onClick={() => setSettingsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700"
                    >
                      <FaKey /> Change Password
                    </NavLink>

                  </div>
                )}

              </div>

              <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded">
                Logout
              </button>
            </>
          )}

        </nav>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

      </div>
      
      {/* MOBILE MENU DRAWER */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#000080] dark:bg-gray-900 text-white transform transition-transform duration-300 z-50
        ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
      >

        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-800">

          <h2 className="text-xl font-bold">
            RealEstate
          </h2>

          <button onClick={() => setMenuOpen(false)}>
            <FaTimes size={22} />
          </button>

        </div>

        <div className="px-6 py-4 space-y-4">

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

              {/* ADMIN */}
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

              {/* AGENT */}
              {user.role === "agent" && (
                <>
                  <NavLink to="/agent/manage-properties" onClick={()=>setMenuOpen(false)} className={linkClass}>
                    <FaBuilding /> Manage Properties
                  </NavLink>

                  <NavLink to="/agent/bookings" onClick={()=>setMenuOpen(false)} className={linkClass}>
                    <FaCalendarCheck /> Bookings
                  </NavLink>
                </>
              )}

              {/* USER */}
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
                className="bg-red-600 px-4 py-2 rounded w-full"
              >
                Logout
              </button>
            </>
          )}

        </div>

      </div>

      {/* OVERLAY */}
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