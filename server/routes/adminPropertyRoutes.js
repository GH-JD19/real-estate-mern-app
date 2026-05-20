const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  adminGetAllProperties,
  adminDeleteProperty,
  adminUpdatePropertyStatus
} = require("../controllers/propertyController")

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ✅ Rate limiter (protect heavy admin actions)
const adminPropertyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // adjust if needed
  message: "Too many requests, please try again later"
})

// ✅ Validate Mongo ObjectId
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

// ✅ Validate property status (only if used)
const validateStatus = (req, res, next) => {
  const { status } = req.body

  const allowedStatuses = ["pending", "approved", "rejected"]

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value"
    })
  }

  next()
}

// 🔐 Apply global protections
router.use(protect, authorize("admin"), adminPropertyLimiter)

// 📊 Get all properties (Admin)
router.get("/properties", adminGetAllProperties)

// ❌ Delete property
router.delete(
  "/properties/:id",
  validateObjectId,
  adminDeleteProperty
)

// 🔄 Update property status
router.put(
  "/properties/status/:id",
  validateObjectId,
  validateStatus,
  adminUpdatePropertyStatus
)

module.exports = router