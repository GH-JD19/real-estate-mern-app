const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  getDashboardStats,
  getMonthlyCharts
} = require("../controllers/adminAnalyticsController")

const rateLimit = require("express-rate-limit")

// ✅ Admin Rate Limiter (safe for heavy queries)
const adminAnalyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many requests, please try again later"
})

// ✅ Protect ALL routes (prevents future mistakes)
router.use(protect, authorize("admin"), adminAnalyticsLimiter)

// Dashboard Stats
router.get("/dashboard", getDashboardStats)

// Monthly Charts
router.get("/charts", getMonthlyCharts)

module.exports = router