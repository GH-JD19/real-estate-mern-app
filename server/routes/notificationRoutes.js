const express = require("express")
const router = express.Router()

const Notification = require("../models/Notification")
const protect = require("../middleware/authMiddleware")

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ✅ Rate limiter (prevents abuse/spam)
const notificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: "Too many requests, please try again later"
})

// ✅ Async handler (prevents crashes)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// ✅ Validate ObjectId
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

// ✅ Build role-based filter safely
const buildFilter = (user) => {
  if (user.role === "admin") return { role: "admin" }
  if (user.role === "agent") return { role: "agent" }
  return { userId: user._id.toString() }
}

// ================= GET NOTIFICATIONS =================
router.get(
  "/",
  protect,
  notificationLimiter,
  asyncHandler(async (req, res) => {
    const filter = buildFilter(req.user)

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      notifications
    })
  })
)


// ================= MARK ONE AS READ =================
router.put(
  "/:id/read",
  protect,
  notificationLimiter,
  validateObjectId,
  asyncHandler(async (req, res) => {
    const filter = {
      _id: req.params.id,
      ...buildFilter(req.user)
    }

    const notification = await Notification.findOne(filter)

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      })
    }

    notification.read = true
    await notification.save()

    res.json({ success: true })
  })
)


// ================= MARK ALL AS READ =================
router.put(
  "/read-all",
  protect,
  notificationLimiter,
  asyncHandler(async (req, res) => {
    const filter = buildFilter(req.user)

    await Notification.updateMany(filter, { read: true })

    res.json({ success: true })
  })
)

module.exports = router