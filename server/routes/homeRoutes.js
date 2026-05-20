const express = require("express")
const router = express.Router()

const { getHomeData } = require("../controllers/homeController")

const rateLimit = require("express-rate-limit")

// ✅ Public rate limiter (protect against traffic spikes / abuse)
const homeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // adjust based on traffic
  message: "Too many requests, please try again later"
})

// ✅ Optional safety wrapper (prevents unhandled async errors)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// ==========================
// PUBLIC HOME ROUTE
// ==========================

router.get(
  "/home-data",
  homeLimiter,
  asyncHandler(getHomeData)
)

module.exports = router