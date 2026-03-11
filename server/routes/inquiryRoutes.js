const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  createInquiry,
  getAgentInquiries,
  getAllInquiries,
  updateInquiryStatus
} = require("../controllers/inquiryController")

// User sends inquiry
router.post("/:propertyId", protect, createInquiry)

// Agent views own inquiries
router.get("/agent", protect, authorize("agent"), getAgentInquiries)

// Admin views all inquiries
router.get("/admin", protect, authorize("admin"), getAllInquiries)

// Update inquiry status
router.patch("/:id", protect, authorize("agent", "admin"), updateInquiryStatus)

module.exports = router