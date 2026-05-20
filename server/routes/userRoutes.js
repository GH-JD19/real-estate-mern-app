const express = require("express")
const router = express.Router()

const {
  requestAgent,
  approveAgent,
  getAgentRequests,
  getUserDashboardStats,
  getUserProfile,
  updateUserProfile
} = require("../controllers/userController")

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")
const { upload } = require("../middleware/uploadMiddleware")

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ============================
// RATE LIMITERS
// ============================

// General user limiter
const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many requests, please try again later"
})

// Sensitive actions limiter (profile update, agent request)
const actionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many actions, please try again later"
})

// Admin limiter
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  message: "Too many admin requests, please try again later"
})

// ============================
// HELPERS
// ============================

// Validate ObjectId
const validateObjectId = (req, res, next) => {
  const { id } = req.params

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    })
  }

  next()
}

// Async wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Safe upload middleware wrapper
const safeUpload = (req, res, next) => {
  upload.single("photo")(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed"
      })
    }
    next()
  })
}

// ============================
// USER ROUTES
// ============================

// Request to become Agent
router.put(
  "/request-agent",
  protect,
  actionLimiter,
  asyncHandler(requestAgent)
)

// Dashboard Stats
router.get(
  "/dashboard-stats",
  protect,
  userLimiter,
  asyncHandler(getUserDashboardStats)
)

// User Profile
router.get(
  "/profile",
  protect,
  userLimiter,
  asyncHandler(getUserProfile)
)

// Update Profile (with image upload)
router.put(
  "/update-profile",
  protect,
  actionLimiter,
  safeUpload,
  asyncHandler(updateUserProfile)
)


// ============================
// ADMIN ROUTES
// ============================

// Get all agent requests
router.get(
  "/agent-requests",
  protect,
  authorize("admin"),
  adminLimiter,
  asyncHandler(getAgentRequests)
)

// Approve agent
router.put(
  "/approve-agent/:id",
  protect,
  authorize("admin"),
  adminLimiter,
  validateObjectId,
  asyncHandler(approveAgent)
)

module.exports = router