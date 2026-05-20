import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect, lazy, Suspense, memo } from "react"
import { Toaster } from "react-hot-toast"

import MainLayout from "./layouts/MainLayout"
import AdminLayout from "./layouts/AdminLayout"
import UserLayout from "./layouts/UserLayout"
import AgentLayout from "./layouts/AgentLayout"

import { NotificationProvider } from "./context/NotificationContext"

import ProtectedRoute from "./routes/ProtectedRoute"
import PublicRoute from "./routes/PublicRoute"
import AutoRedirect from "./routes/AutoRedirect"

import GlobalLoader from "./pages/common/GlobalLoader"

// 🔥 LAZY LOADING
const Home = lazy(() => import("./pages/Home"))
const PropertyListing = lazy(() => import("./pages/PropertyListing"))
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const PendingApproval = lazy(() => import("./pages/PendingApproval"))
const About = lazy(() => import("./pages/About"))
const Terms = lazy(() => import("./pages/Terms"))
const Privacy = lazy(() => import("./pages/Privacy"))
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"))
const ResetPassword = lazy(() => import("./pages/ResetPassword"))
const NotFound = lazy(() => import("./pages/NotFound"))

const UserDashboard = lazy(() => import("./pages/user/UserDashboard"))
const SavedProperties = lazy(() => import("./pages/user/SavedProperties"))
const MyBookings = lazy(() => import("./pages/user/MyBookings"))

const AgentDashboard = lazy(() => import("./pages/agent/AgentDashboard"))
const ManageProperties = lazy(() => import("./pages/agent/ManageProperties"))
const MyListings = lazy(() => import("./pages/agent/MyListings"))
const AgentBookings = lazy(() => import("./pages/agent/AgentBookings"))
const AgentPendingProperties = lazy(() => import("./pages/agent/AgentPendingProperties"))
const AgentAllProperties = lazy(() => import("./pages/agent/AgentAllProperties"))
const AgentRejectedProperties = lazy(() => import("./pages/agent/AgentRejectedProperties"))

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"))
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"))
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"))
const AdminPendingProperties = lazy(() => import("./pages/admin/AdminPendingProperties"))
const AdminViewProperty = lazy(() => import("./pages/admin/AdminViewProperty"))
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"))

const Profile = lazy(() => import("./pages/common/Profile"))
const ChangePassword = lazy(() => import("./pages/common/ChangePassword"))

// ✅ NEW (COMMON)
const AddProperty = lazy(() => import("./pages/common/AddProperty"))
const EditProperty = lazy(() => import("./pages/common/EditProperty"))

// ================= SCROLL FIX =================
const ScrollToTop = memo(() => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname])

  return null
})

function App() {
  return (
    <NotificationProvider>
      <ScrollToTop />

      {/* 🔹 GLOBAL TOASTER */}
      <Toaster position="top-right" />

      <Suspense fallback={<GlobalLoader />}>
        <Routes>

          {/* ================= MAIN ================= */}
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
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route path="user-dashboard" element={<UserDashboard />} />
              <Route path="user/saved" element={<SavedProperties />} />
              <Route path="user/bookings" element={<MyBookings />} />
              <Route path="user/profile" element={<Profile />} />
              <Route path="user/change-password" element={<ChangePassword />} />
            </Route>

            {/* ================= AGENT ================= */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["agent"]}>
                  <AgentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="agent-dashboard" element={<AgentDashboard />} />
              <Route path="agent/manage-properties" element={<ManageProperties />} />
              <Route path="agent/add-property" element={<AddProperty />} />
              <Route path="agent/edit-property/:id" element={<EditProperty />} />
              <Route path="agent/my-listings" element={<MyListings />} />
              <Route path="agent/pending-properties" element={<AgentPendingProperties />} />
              <Route path="agent/bookings" element={<AgentBookings />} />
              <Route path="agent/all-properties" element={<AgentAllProperties />} />
              <Route path="agent/rejected-properties" element={<AgentRejectedProperties />} />
              <Route path="agent/profile" element={<Profile />} />
              <Route path="agent/change-password" element={<ChangePassword />} />
            </Route>

            {/* ================= ADMIN ================= */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="admin-dashboard" element={<AdminDashboard />} />
              <Route path="admin/properties" element={<AdminProperties />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/analytics" element={<AdminAnalytics />} />
              <Route path="admin/pending-properties" element={<AdminPendingProperties />} />
              <Route path="admin/property/:id" element={<AdminViewProperty />} />
              <Route path="admin/bookings" element={<AdminBookings />} />

              {/* ✅ ADMIN EDIT ACCESS */}
              <Route path="admin/edit-property/:id" element={<EditProperty />} />

              <Route path="admin/profile" element={<Profile />} />
              <Route path="admin/change-password" element={<ChangePassword />} />
            </Route>

            {/* NOT FOUND */}
            <Route path="*" element={<NotFound />} />
          </Route>

        </Routes>
      </Suspense>
    </NotificationProvider>
  )
}

export default App