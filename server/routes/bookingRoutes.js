const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  createBooking,
  getUserBookings,
  getAgentBookings,
  updateBookingStatus
} = require("../controllers/bookingController")


// ============================
// USER ROUTES
// ============================

// Book a visit
router.post(
  "/",
  protect,
  authorize("user"),
  createBooking
)

// Get my visits
router.get(
  "/my",
  protect,
  authorize("user"),
  getUserBookings
)


// ============================
// AGENT ROUTES
// ============================

// Get bookings for my properties
router.get(
  "/agent",
  protect,
  authorize("agent"),
  getAgentBookings
)

// Accept / Reject booking
router.put(
  "/:id/status",
  protect,
  authorize("agent"),
  updateBookingStatus
)

module.exports = router