const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  bookVisit,
  getUserVisits,
  getAgentVisits,
  updateVisitStatus,
  getAllVisits
} = require("../controllers/visitController")

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ============================
// RATE LIMITER
// ============================

const visitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 40,
  message: "Too many requests, please try again later"
})

// ============================
// HELPERS
// ============================

// Validate ObjectId
const validateObjectId = (param) => (req, res, next) => {
  const value = req.params[param]

  if (value && !mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${param}`
    })
  }

  next()
}

// Async wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// ============================
// ROUTES
// ============================

// Book visit (user or agent allowed if needed)
router.post(
  "/:propertyId",
  protect,
  visitLimiter,
  validateObjectId("propertyId"),
  asyncHandler(bookVisit)
)

// User visits
router.get(
  "/user",
  protect,
  authorize("user"),
  visitLimiter,
  asyncHandler(getUserVisits)
)

// Agent visits
router.get(
  "/agent",
  protect,
  authorize("agent"),
  visitLimiter,
  asyncHandler(getAgentVisits)
)

// Admin visits
router.get(
  "/admin",
  protect,
  authorize("admin"),
  visitLimiter,
  asyncHandler(getAllVisits)
)

// Update visit status (agent only)
router.patch(
  "/:id",
  protect,
  authorize("agent"),
  visitLimiter,
  validateObjectId("id"),
  asyncHandler(updateVisitStatus)
)

module.exports = router