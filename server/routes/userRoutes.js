const express = require("express")
const router = express.Router()

const {
  requestAgent,
  approveAgent,
  getAgentRequests,
  getUserDashboardStats,
  getUserProfile,
  updateUserProfile
} = require("../controllers/userController")

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")
const upload = require("../middleware/uploadMiddleware")

// ================= USER =================

// Request to become Agent
router.put("/request-agent", protect, requestAgent)

// Dashboard Stats
router.get("/dashboard-stats", protect, getUserDashboardStats)

// User Profile
router.get("/profile", protect, getUserProfile)

router.put(
  "/update-profile",
  protect,
  upload.single("photo"),
  updateUserProfile
)


// ================= ADMIN =================

// Get all agent requests
router.get(
  "/agent-requests",
  protect,
  authorize("admin"),
  getAgentRequests
)

// Approve agent
router.put(
  "/approve-agent/:id",
  protect,
  authorize("admin"),
  approveAgent
)

module.exports = router