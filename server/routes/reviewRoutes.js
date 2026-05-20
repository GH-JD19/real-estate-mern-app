const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")

const {
  addReview,
  getPropertyReviews
} = require("../controllers/reviewController")

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ============================
// RATE LIMITERS
// ============================

// Public read limiter
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later"
})

// Write limiter (review submission)
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many reviews submitted, please try again later"
})

// ============================
// HELPERS
// ============================

// Validate ObjectId
const validateObjectId = (req, res, next) => {
  const { propertyId } = req.params

  if (propertyId && !mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid property ID"
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

// Add review (protected)
router.post(
  "/:propertyId",
  protect,
  writeLimiter,
  validateObjectId,
  asyncHandler(addReview)
)

// Get reviews (public)
router.get(
  "/:propertyId",
  publicLimiter,
  validateObjectId,
  asyncHandler(getPropertyReviews)
)

module.exports = router