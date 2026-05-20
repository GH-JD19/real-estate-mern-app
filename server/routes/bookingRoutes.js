const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  bookingValidation,
  bookingStatusValidation,
} = require("../validators/booking.validator")

const {
  createBooking,
  getUserBookings,
  getAgentBookings,
  updateBookingStatus
} = require("../controllers/bookingController")

const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")

// ✅ Rate limiter (prevents spam bookings & abuse)
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  message: "Too many requests, please try again later"
})

// ✅ Validate Mongo ObjectId
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

// ============================
// USER ROUTES
// ============================

const userRouter = express.Router()

userRouter.use(protect, authorize("user"), bookingLimiter)

// Book a visit
userRouter.post("/", bookingValidation, createBooking)

// Get my visits
userRouter.get("/my", getUserBookings)


// ============================
// AGENT ROUTES
// ============================

const agentRouter = express.Router()

agentRouter.use(protect, authorize("agent"), bookingLimiter)

// Get bookings for my properties
agentRouter.get("/agent", getAgentBookings)

// Accept / Reject booking
agentRouter.put(
  "/:id/status",
  validateObjectId,
  bookingStatusValidation,
  updateBookingStatus
)


// ============================
// MOUNT ROUTES
// ============================

router.use("/", userRouter)
router.use("/", agentRouter)

module.exports = router