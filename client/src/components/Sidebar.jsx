import {
  FaBars,
  FaHome,
  FaUsers,
  FaBuilding,
  FaChartLine,
  FaHeart,
  FaCalendarCheck,
  FaUser,
  FaKey,
  FaCog
} from "react-icons/fa"

import { useAuth } from "../context/AuthContext"
import { NavLink } from "react-router-dom"
import { useState, useEffect, useRef } from "react"

const Sidebar = ({ collapsed, setCollapsed }) => {

  const { user } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [setCollapsed])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) return null

  const dashboardLink =
    user.role === "admin"
      ? "/admin-dashboard"
      : user.role === "agent"
      ? "/agent-dashboard"
      : "/user-dashboard"

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out group
    ${
      isActive
        ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`

  const handleMobileClick = () => {
    if (window.innerWidth < 768) {
      setCollapsed(true)
    }
  }

  const Tooltip = ({ label, children }) => (
    <div className="relative group flex items-center">
      {children}
      {collapsed && (
        <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-[9999]">
          {label}
        </span>
      )}
    </div>
  )

  return (
    <div
      className={`
        relative
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm
        border-r border-gray-200 dark:border-gray-700
        text-gray-700 dark:text-gray-300
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
        min-h-[calc(100vh-64px)]
        px-3 py-5 overflow-visible flex flex-col
      `}
    >

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg">
          RE
        </div>
        {!collapsed && (
          <h1 className="text-lg font-semibold tracking-wide">
            RealEstate
          </h1>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <FaBars />
      </button>

      <ul className="space-y-6 flex-1">

        {/* Dashboard */}
        <NavLink to={dashboardLink} className={linkClass} onClick={handleMobileClick}>
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>}
              <Tooltip label="Dashboard">
                <FaHome className="text-lg group-hover:scale-110 transition-transform" />
              </Tooltip>
              {!collapsed && <span>Dashboard</span>}
            </>
          )}
        </NavLink>

        {/* USER */}
        {user.role === "user" && (
          <>
            {!collapsed && <p className="text-xs uppercase text-gray-400 px-2 tracking-wider">User</p>}

            <NavLink to="/user/saved" className={linkClass} onClick={handleMobileClick}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>}
                  <Tooltip label="Wishlist">
                    <FaHeart className="text-lg group-hover:scale-110 transition-transform" />
                  </Tooltip>
                  {!collapsed && <span>Wishlist</span>}
                </>
              )}
            </NavLink>

            <NavLink to="/user/bookings" className={linkClass} onClick={handleMobileClick}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>}
                  <Tooltip label="My Visits">
                    <FaCalendarCheck className="text-lg group-hover:scale-110 transition-transform" />
                  </Tooltip>
                  {!collapsed && <span>My Visits</span>}
                </>
              )}
            </NavLink>
          </>
        )}

        {/* AGENT */}
        {user.role === "agent" && (
          <>
            {!collapsed && <p className="text-xs uppercase text-gray-400 px-2 tracking-wider">Agent</p>}

            <NavLink to="/agent/manage-properties" className={linkClass} onClick={handleMobileClick}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>}
                  <Tooltip label="Manage Properties">
                    <FaBuilding className="text-lg group-hover:scale-110 transition-transform" />
                  </Tooltip>
                  {!collapsed && <span>Manage Properties</span>}
                </>
              )}
            </NavLink>

            <NavLink to="/agent/bookings" className={linkClass} onClick={handleMobileClick}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>}
                  <Tooltip label="Bookings">
                    <FaCalendarCheck className="text-lg group-hover:scale-110 transition-transform" />
                  </Tooltip>
                  {!collapsed && <span>Bookings</span>}
                </>
              )}
            </NavLink>
          </>
        )}

        {/* ADMIN */}
        {user.role === "admin" && (
          <>
            {!collapsed && <p className="text-xs uppercase text-gray-400 px-2 tracking-wider">Admin</p>}

            <NavLink to="/admin/properties" className={linkClass} onClick={handleMobileClick}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>}
                  <Tooltip label="Properties">
                    <FaBuilding className="text-lg group-hover:scale-110 transition-transform" />
                  </Tooltip>
                  {!collapsed && <span>Properties</span>}
                </>
              )}
            </NavLink>

            <NavLink to="/admin/users" className={linkClass} onClick={handleMobileClick}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>}
                  <Tooltip label="Users">
                    <FaUsers className="text-lg group-hover:scale-110 transition-transform" />
                  </Tooltip>
                  {!collapsed && <span>Users</span>}
                </>
              )}
            </NavLink>

            <NavLink to="/admin/analytics" className={linkClass} onClick={handleMobileClick}>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>}
                  <Tooltip label="Analytics">
                    <FaChartLine className="text-lg group-hover:scale-110 transition-transform" />
                  </Tooltip>
                  {!collapsed && <span>Analytics</span>}
                </>
              )}
            </NavLink>
          </>
        )}

        {/* SETTINGS */}
        <div className="relative" ref={settingsRef}>
          <div
            onClick={(e) => {
              e.stopPropagation()
              setSettingsOpen(prev => !prev)
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 group"
          >
            <Tooltip label="Settings">
              <FaCog className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            </Tooltip>
            {!collapsed && <span>Settings</span>}
          </div>

          {!collapsed && settingsOpen && (
            <div className="ml-6 mt-2 space-y-2">

              <NavLink
                to={`/${user.role}/profile`}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out group
                  ${
                    isActive
                      ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3 w-full">
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>
                    )}
                    <FaUser className="text-lg group-hover:scale-110 transition-transform" />
                    <span>Profile</span>
                  </div>
                )}
              </NavLink>

              <NavLink
                to={`/${user.role}/change-password`}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out group
                  ${
                    isActive
                      ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3 w-full">
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>
                    )}
                    <FaKey className="text-lg group-hover:scale-110 transition-transform" />
                    <span>Change Password</span>
                  </div>
                )}
              </NavLink>

            </div>
          )}

          {/* FIXED COLLAPSED DROPDOWN */}
          {collapsed && settingsOpen && (
            <div
              className="
                absolute 
                left-full 
                ml-2 
                top-0 
                bg-white dark:bg-gray-900 
                border border-gray-200 dark:border-gray-700 
                rounded-xl shadow-xl 
                w-52 
                p-2 
                backdrop-blur-md 
                z-[9999]
              "
            >

              <NavLink
                to={`/${user.role}/profile`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSettingsOpen(false)}
              >
                <FaUser className="text-lg" />
                Profile
              </NavLink>

              <NavLink
                to={`/${user.role}/change-password`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSettingsOpen(false)}
              >
                <FaKey className="text-lg" />
                Change Password
              </NavLink>

            </div>
          )}

        </div>

      </ul>

      {/* USER PROFILE */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Sidebar