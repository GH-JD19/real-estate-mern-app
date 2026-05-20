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

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ✅ Rate limiter (prevents spam inquiries)
const inquiryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 40,
  message: "Too many requests, please try again later"
})

// ✅ Validate Mongo ObjectId
const validateObjectId = (paramName) => (req, res, next) => {
  const value = req.params[paramName]

  if (value && !mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName}`
    })
  }

  next()
}

// ✅ Validate inquiry status update (safe values only)
const validateStatus = (req, res, next) => {
  const { status } = req.body

  const allowedStatuses = ["pending", "resolved", "rejected"]

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value"
    })
  }

  next()
}

// ============================
// USER ROUTE
// ============================

// User sends inquiry
router.post(
  "/:propertyId",
  protect,
  inquiryLimiter,
  validateObjectId("propertyId"),
  createInquiry
)


// ============================
// AGENT ROUTES
// ============================

const agentRouter = express.Router()

agentRouter.use(protect, authorize("agent"), inquiryLimiter)

// Agent views own inquiries
agentRouter.get("/agent", getAgentInquiries)


// ============================
// ADMIN ROUTES
// ============================

const adminRouter = express.Router()

adminRouter.use(protect, authorize("admin"), inquiryLimiter)

// Admin views all inquiries
adminRouter.get("/admin", getAllInquiries)


// ============================
// SHARED UPDATE ROUTE (Agent + Admin)
// ============================

router.patch(
  "/:id",
  protect,
  authorize("agent", "admin"),
  inquiryLimiter,
  validateObjectId("id"),
  validateStatus,
  updateInquiryStatus
)


// ============================
// MOUNT ROUTES
// ============================

router.use("/", agentRouter)
router.use("/", adminRouter)

module.exports = router