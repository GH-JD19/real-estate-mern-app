const express = require("express")
const router = express.Router()

const Subscriber = require("../models/Subscriber")

const rateLimit = require("express-rate-limit")

// ============================
// RATE LIMITER (ANTI-SPAM)
// ============================

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: "Too many subscription attempts, please try again later"
})

// ============================
// HELPERS
// ============================

// Async handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ============================
// ROUTES
// ============================

// POST /api/subscribe
router.post(
  "/",
  subscribeLimiter,
  asyncHandler(async (req, res) => {
    let { email } = req.body

    // Normalize email
    email = email?.trim().toLowerCase()

    // Validate email
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email"
      })
    }

    // Check duplicate (case-insensitive safe)
    const existing = await Subscriber.findOne({ email })

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already subscribed"
      })
    }

    const subscriber = await Subscriber.create({ email })

    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      subscriber
    })
  })
)

module.exports = router