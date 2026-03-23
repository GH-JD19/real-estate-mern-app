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

// ADMIN ROLE CHECK
const adminOnly = (req, res, next) => {

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    })
  }

  next()
}

// ==========================
// ADMIN DASHBOARD
// ==========================

router.get("/stats", protect, adminOnly, getAdminStats)

router.get("/chart", protect, adminOnly, getAdminChartData)


// ==========================
// USER MANAGEMENT
// ==========================

router.get("/users", protect, adminOnly, getAllUsers)

router.patch("/activate/:id", protect, adminOnly, activateUser)

router.patch("/block/:id", protect, adminOnly, toggleBlockUser)

router.patch("/promote/:id", protect, adminOnly, promoteToAgent)

router.patch("/demote/:id", protect, adminOnly, demoteToUser)

router.patch("/bulk", protect, adminOnly, bulkAction)

module.exports = router