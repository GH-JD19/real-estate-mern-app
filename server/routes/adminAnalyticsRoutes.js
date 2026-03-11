const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  getDashboardStats,
  getMonthlyCharts
} = require("../controllers/adminAnalyticsController")

// Dashboard Stats
router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboardStats
)

// Monthly Charts
router.get(
  "/charts",
  protect,
  authorize("admin"),
  getMonthlyCharts
)

module.exports = router