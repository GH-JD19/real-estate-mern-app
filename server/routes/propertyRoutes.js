const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")
const { handleUpload } = require("../middleware/uploadMiddleware")

const { propertyValidation } = require("../validators/property.validator")

const {
  createProperty,
  getProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getMyProperties,
  getAgentProperties,
  adminGetAllProperties,
  adminDeleteProperty,
  adminUpdatePropertyStatus,
  toggleFeatured
} = require("../controllers/propertyController")

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ============================
// RATE LIMITERS
// ============================

// Public limiter (listing & viewing)
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later"
})

// Protected actions limiter (create/update/delete)
const actionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  message: "Too many actions, please try again later"
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
// PUBLIC ROUTES
// ============================

router.get("/featured", publicLimiter, asyncHandler(getFeaturedProperties))

// MUST come before :id
router.get(
  "/my",
  protect,
  authorize("user", "agent"),
  actionLimiter,
  asyncHandler(getMyProperties)
)

router.get(
  "/agent",
  protect,
  authorize("agent"),
  actionLimiter,
  asyncHandler(getAgentProperties)
)

// All properties
router.get("/", publicLimiter, asyncHandler(getProperties))

// Single property
router.get(
  "/:id",
  publicLimiter,
  validateObjectId,
  asyncHandler(getSingleProperty)
)


// ============================
// AGENT / ADMIN CRUD
// ============================

router.post(
  "/",
  protect,
  authorize("agent", "admin"),
  actionLimiter,
  propertyValidation,
  handleUpload("images", 5),
  asyncHandler(createProperty)
)

router.put(
  "/:id",
  protect,
  authorize("agent", "admin"),
  actionLimiter,
  validateObjectId,
  propertyValidation,
  asyncHandler(updateProperty)
)

router.delete(
  "/:id",
  protect,
  authorize("agent", "admin"),
  actionLimiter,
  validateObjectId,
  asyncHandler(deleteProperty)
)


// ============================
// ADMIN ROUTES
// ============================

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  actionLimiter,
  asyncHandler(adminGetAllProperties)
)

router.delete(
  "/admin/:id",
  protect,
  authorize("admin"),
  actionLimiter,
  validateObjectId,
  asyncHandler(adminDeleteProperty)
)

router.put(
  "/admin/status/:id",
  protect,
  authorize("admin"),
  actionLimiter,
  validateObjectId,
  asyncHandler(adminUpdatePropertyStatus)
)

router.put(
  "/admin/feature/:id",
  protect,
  authorize("admin"),
  actionLimiter,
  validateObjectId,
  asyncHandler(toggleFeatured)
)

module.exports = router