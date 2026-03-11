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
import { useState, useEffect } from "react"

const Sidebar = ({ collapsed, setCollapsed }) => {

  const { user } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)

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

  if (!user) return null

  const dashboardLink =
    user.role === "admin"
      ? "/admin-dashboard"
      : user.role === "agent"
      ? "/agent-dashboard"
      : "/user-dashboard"

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded transition 
    ${isActive ? "bg-blue-700" : "hover:bg-blue-700"}`

  const handleMobileClick = () => {
    if (window.innerWidth < 768) {
      setCollapsed(true)
    }
  }

  return (
    <div
      className={`
        bg-blue-900 dark:bg-gray-800 text-white
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        min-h-[calc(100vh-64px)]
        p-4
      `}
    >

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-6 text-xl"
      >
        <FaBars />
      </button>

      <ul className="space-y-4">

        {/* Dashboard */}
        <NavLink
          to={dashboardLink}
          className={linkClass}
          onClick={handleMobileClick}
        >
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* ================= USER MENU ================= */}
        {user.role === "user" && (
          <>
            <NavLink
              to="/user/saved"
              className={linkClass}
              onClick={handleMobileClick}
            >
              <FaHeart />
              {!collapsed && <span>Wishlist</span>}
            </NavLink>

            <NavLink
              to="/user/bookings"
              className={linkClass}
              onClick={handleMobileClick}
            >
              <FaCalendarCheck />
              {!collapsed && <span>My Visits</span>}
            </NavLink>
          </>
        )}

        {/* ================= AGENT MENU ================= */}
        {user.role === "agent" && (
          <>
            <NavLink
              to="/agent/manage-properties"
              className={linkClass}
              onClick={handleMobileClick}
            >
              <FaBuilding />
              {!collapsed && <span>Manage Properties</span>}
            </NavLink>

            <NavLink
              to="/agent/bookings"
              className={linkClass}
              onClick={handleMobileClick}
            >
              <FaCalendarCheck />
              {!collapsed && <span>Bookings</span>}
            </NavLink>
          </>
        )}

        {/* ================= ADMIN MENU ================= */}
        {user.role === "admin" && (
          <>
            <NavLink
              to="/admin/properties"
              className={linkClass}
              onClick={handleMobileClick}
            >
              <FaBuilding />
              {!collapsed && <span>Properties</span>}
            </NavLink>

            <NavLink
              to="/admin/users"
              className={linkClass}
              onClick={handleMobileClick}
            >
              <FaUsers />
              {!collapsed && <span>Users</span>}
            </NavLink>

            <NavLink
              to="/admin/analytics"
              className={linkClass}
              onClick={handleMobileClick}
            >
              <FaChartLine />
              {!collapsed && <span>Analytics</span>}
            </NavLink>
          </>
        )}

        {/* ================= SETTINGS ================= */}
        <div className="relative">

          <div
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center gap-3 p-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            <FaCog />
            {!collapsed && <span>Settings</span>}
          </div>

          {/* Expanded Sidebar */}
          {!collapsed && settingsOpen && (
            <div className="ml-6 mt-2 space-y-2">

              <NavLink
                to={`/${user.role}/profile`}
                className={linkClass}
                onClick={handleMobileClick}
              >
                <FaUser />
                <span>Profile</span>
              </NavLink>

              <NavLink
                to={`/${user.role}/change-password`}
                className={linkClass}
                onClick={handleMobileClick}
              >
                <FaKey />
                <span>Change Password</span>
              </NavLink>

            </div>
          )}

          {/* Collapsed Sidebar Dropdown */}
          {collapsed && settingsOpen && (
            <div className="absolute left-16 top-0 bg-blue-900 border border-blue-700 rounded shadow-lg w-48 z-50">

              <NavLink
                to={`/${user.role}/profile`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700"
                onClick={() => {
                  setSettingsOpen(false)
                  handleMobileClick()
                }}
              >
                <FaUser /> Profile
              </NavLink>

              <NavLink
                to={`/${user.role}/change-password`}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700"
                onClick={() => {
                  setSettingsOpen(false)
                  handleMobileClick()
                }}
              >
                <FaKey /> Change Password
              </NavLink>

            </div>
          )}

        </div>

      </ul>
    </div>
  )
}

export default Sidebar