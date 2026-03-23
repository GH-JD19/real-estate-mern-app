import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"

import MainLayout from "./layouts/MainLayout"
import AdminLayout from "./layouts/AdminLayout"
import UserLayout from "./layouts/UserLayout"
import AgentLayout from "./layouts/AgentLayout"

import ProtectedRoute from "./routes/ProtectedRoute"
import PublicRoute from "./routes/PublicRoute"
import AutoRedirect from "./routes/AutoRedirect"

import GlobalLoader from "./pages/common/GlobalLoader"

import Home from "./pages/Home"
import PropertyListing from "./pages/PropertyListing"
import PropertyDetails from "./pages/PropertyDetails"
import Login from "./pages/Login"
import Register from "./pages/Register"
import PendingApproval from "./pages/PendingApproval"
import About from "./pages/About"
import Terms from "./pages/Terms"
import Privacy from "./pages/Privacy"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import NotFound from "./pages/NotFound"

import UserDashboard from "./pages/user/UserDashboard"
import SavedProperties from "./pages/user/SavedProperties"
import MyBookings from "./pages/user/MyBookings"

import AgentDashboard from "./pages/agent/AgentDashboard"
import ManageProperties from "./pages/agent/ManageProperties"
import AddProperty from "./pages/agent/AddProperty"
import MyListings from "./pages/agent/MyListings"
import AgentBookings from "./pages/agent/AgentBookings"
import AgentPendingProperties from "./pages/agent/AgentPendingProperties"
import AgentAllProperties from "./pages/agent/AgentAllProperties"
import AgentRejectedProperties from "./pages/agent/AgentRejectedProperties"

import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminProperties from "./pages/admin/AdminProperties"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminAnalytics from "./pages/admin/AdminAnalytics"
import AdminPendingProperties from "./pages/admin/AdminPendingProperties"
import AdminViewProperty from "./pages/admin/AdminViewProperty"
import AdminBookings from "./pages/admin/AdminBookings"

import Profile from "./pages/common/Profile"
import ChangePassword from "./pages/common/ChangePassword"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])

  return null
}

function App() {
  return (
    <>
    <GlobalLoader />   {/* 🔥 ADD THIS */}
      <ScrollToTop />

      <Routes>

        <Route
          path="/"
          element={
            <AutoRedirect>
              <MainLayout />
            </AutoRedirect>
          }
        >

          {/* PUBLIC */}
          <Route index element={<Home />} />
          <Route path="properties" element={<PropertyListing />} />
          <Route path="property/:id" element={<PropertyDetails />} />
          <Route path="about" element={<About />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />

          {/* AUTH */}
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="pending-approval"
            element={
              <PublicRoute>
                <PendingApproval />
              </PublicRoute>
            }
          />

          {/* ================= USER ================= */}

          <Route
            path="user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserLayout>
                  <UserDashboard />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="user/saved"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserLayout>
                  <SavedProperties />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="user/bookings"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserLayout>
                  <MyBookings />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          {/* ================= AGENT ================= */}

          <Route
            path="agent-dashboard"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <AgentDashboard />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="agent/manage-properties"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <ManageProperties />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="agent/add-property"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <AddProperty />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="agent/my-listings"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <MyListings />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="agent/pending-properties"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <AgentPendingProperties />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="agent/bookings"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <AgentBookings />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent/all-properties"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <AgentAllProperties />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent/rejected-properties"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <AgentRejectedProperties />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN ================= */}

          <Route
            path="admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/properties"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminProperties />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/pending-properties"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminPendingProperties />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/property/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminViewProperty />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/bookings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminBookings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ================= PROFILE ================= */}

          <Route
            path="/user/profile"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserLayout>
                  <Profile />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="agent/profile"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <Profile />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/profile"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* ================= CHANGE PASSWORD ================= */}

          <Route
            path="user/change-password"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserLayout>
                  <ChangePassword />
                </UserLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="agent/change-password"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout>
                  <ChangePassword />
                </AgentLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/change-password"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <ChangePassword />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  )
}

export default App