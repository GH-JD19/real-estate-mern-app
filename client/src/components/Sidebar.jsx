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

// ✅ Role constants
const ROLES = {
  ADMIN: "admin",
  AGENT: "agent",
  USER: "user"
}

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef()

  // ✅ Debounced resize (performance)
  useEffect(() => {
    let timeout

    const handleResize = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (window.innerWidth < 768) {
          setCollapsed(true)
        }
      }, 150)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeout)
    }
  }, [setCollapsed])

  // ✅ Click outside
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
    user.role === ROLES.ADMIN
      ? "/admin-dashboard"
      : user.role === ROLES.AGENT
      ? "/agent-dashboard"
      : "/user-dashboard"

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out group active:scale-95
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

  // ✅ Tooltip
  const Tooltip = ({ label, children }) => (
    <div className="relative group flex items-center">
      {children}
      {collapsed && (
        <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
          {label}
        </span>
      )}
    </div>
  )

  // ✅ Reusable Link Component
  const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink to={to} className={linkClass} onClick={handleMobileClick}>
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r"></span>
          )}
          <Tooltip label={label}>
            <Icon className="text-lg group-hover:scale-110 group-hover:translate-x-1 transition-transform" />
          </Tooltip>
          {!collapsed && <span>{label}</span>}
        </>
      )}
    </NavLink>
  )

  return (
    <div
      role="navigation"
      aria-label="Sidebar Navigation"
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
        aria-label="Toggle Sidebar"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <FaBars />
      </button>

      <ul className="space-y-6 flex-1">
        {/* Dashboard */}
        <SidebarLink to={dashboardLink} icon={FaHome} label="Dashboard" />

        {/* USER */}
        {user.role === ROLES.USER && (
          <>
            {!collapsed && (
              <p className="text-xs uppercase text-gray-400 px-2 tracking-wider">
                User
              </p>
            )}

            <SidebarLink to="/user/saved" icon={FaHeart} label="Wishlist" />
            <SidebarLink to="/user/bookings" icon={FaCalendarCheck} label="My Visits" />
          </>
        )}

        {/* AGENT */}
        {user.role === ROLES.AGENT && (
          <>
            {!collapsed && (
              <p className="text-xs uppercase text-gray-400 px-2 tracking-wider">
                Agent
              </p>
            )}

            <SidebarLink
              to="/agent/manage-properties"
              icon={FaBuilding}
              label="Manage Properties"
            />
            <SidebarLink
              to="/agent/bookings"
              icon={FaCalendarCheck}
              label="Bookings"
            />
          </>
        )}

        {/* ADMIN */}
        {user.role === ROLES.ADMIN && (
          <>
            {!collapsed && (
              <p className="text-xs uppercase text-gray-400 px-2 tracking-wider">
                Admin
              </p>
            )}

            <SidebarLink to="/admin/properties" icon={FaBuilding} label="Properties" />
            <SidebarLink to="/admin/users" icon={FaUsers} label="Users" />
            <SidebarLink to="/admin/analytics" icon={FaChartLine} label="Analytics" />
          </>
        )}

        {/* SETTINGS */}
        <div
          className="relative"
          ref={settingsRef}
        >
          <div
            role="button"
            tabIndex={0}
            aria-expanded={settingsOpen}
            onClick={(e) => {
              e.stopPropagation()
              setSettingsOpen((prev) => !prev)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSettingsOpen((prev) => !prev)
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 group"
          >
            <Tooltip label="Settings">
              <FaCog className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            </Tooltip>
            {!collapsed && <span>Settings</span>}
          </div>

          {/* Expanded */}
          {!collapsed && settingsOpen && (
            <div className="ml-6 mt-2 space-y-2">
              <SidebarLink
                to={`/${user.role}/profile`}
                icon={FaUser}
                label="Profile"
              />
              <SidebarLink
                to={`/${user.role}/change-password`}
                icon={FaKey}
                label="Change Password"
              />
            </div>
          )}

          {/* Collapsed Dropdown */}
          {collapsed && settingsOpen && (
            <div className="absolute left-full top-0 ml-2 max-w-[90vw] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-52 p-2 backdrop-blur-md z-50">
              <NavLink
                to={`/${user.role}/profile`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSettingsOpen(false)}
              >
                <FaUser />
                Profile
              </NavLink>

              <NavLink
                to={`/${user.role}/change-password`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSettingsOpen(false)}
              >
                <FaKey />
                Change Password
              </NavLink>
            </div>
          )}
        </div>
      </ul>

      {/* USER PROFILE */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
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