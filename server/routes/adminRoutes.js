const express = require("express")
const router = express.Router()

const {
  getAdminStats,
  getAdminChartData,
  getAllUsers,
  promoteToAgent,
  demoteToUser,
  toggleBlockUser,
  activateUser,
  bulkAction
} = require("../controllers/adminController")

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ✅ Rate limiter (protect admin panel + DB)
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 40,
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

// ✅ Validate bulk action payload (safety critical)
const validateBulkAction = (req, res, next) => {
  const { userIds, action } = req.body

  const allowedActions = ["activate", "block", "promote", "demote"]

  if (
    !Array.isArray(userIds) ||
    userIds.length === 0 ||
    userIds.some(id => !mongoose.Types.ObjectId.isValid(id))
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid or empty userIds array"
    })
  }

  if (!allowedActions.includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bulk action"
    })
  }

  next()
}

// 🔐 Apply global protections (NO chance of unprotected route)
router.use(protect, authorize("admin"), adminLimiter)

// ==========================
// ADMIN DASHBOARD
// ==========================

router.get("/stats", getAdminStats)

router.get("/chart", getAdminChartData)


// ==========================
// USER MANAGEMENT
// ==========================

router.get("/users", getAllUsers)

router.patch("/activate/:id", validateObjectId, activateUser)

router.patch("/block/:id", validateObjectId, toggleBlockUser)

router.patch("/promote/:id", validateObjectId, promoteToAgent)

router.patch("/demote/:id", validateObjectId, demoteToUser)

router.patch("/bulk", validateBulkAction, bulkAction)

module.exports = router