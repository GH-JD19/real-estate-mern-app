const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  getAdminStats,
  getAdminChartData,
  getAllUsers,
  promoteToAgent,
  demoteToUser,
  toggleBlockUser
} = require("../controllers/adminController")

// ============================
// ADMIN PROTECTION
// ============================
router.use(protect)
router.use(authorize("admin"))


// ============================
// DASHBOARD
// ============================
router.get("/stats", getAdminStats)
router.get("/charts", getAdminChartData)


// ============================
// USER MANAGEMENT
// ============================
router.get("/users", getAllUsers)

router.put("/users/:id/promote", promoteToAgent)
router.put("/users/:id/demote", demoteToUser)
router.put("/users/:id/block", toggleBlockUser)


module.exports = router