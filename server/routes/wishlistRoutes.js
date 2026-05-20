const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require("../controllers/wishlistController")

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ============================
// RATE LIMITER
// ============================

const wishlistLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: "Too many requests, please try again later"
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

// ============================
// APPLY GLOBAL PROTECTION
// ============================

router.use(protect, wishlistLimiter)

// ============================
// ROUTES
// ============================

// Add property to wishlist
router.put(
  "/add/:id",
  validateObjectId,
  asyncHandler(addToWishlist)
)

// Remove property from wishlist
router.put(
  "/remove/:id",
  validateObjectId,
  asyncHandler(removeFromWishlist)
)

// Get user's wishlist
router.get(
  "/",
  asyncHandler(getWishlist)
)

module.exports = router