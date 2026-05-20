const mongoose = require("mongoose")
const Booking = require("../models/Booking")
const Property = require("../models/Property")

// ============================
// HELPERS
// ============================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const ALLOWED_STATUS = ["PENDING", "APPROVED", "REJECTED"]


// ============================
// USER: CREATE BOOKING
// ============================
exports.createBooking = async (req, res) => {
  try {

    const { propertyId, date } = req.body

    if (!isValidId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      })
    }

    if (!date || new Date(date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date"
      })
    }

    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    const existing = await Booking.findOne({
      user: req.user._id,
      property: propertyId,
      status: "PENDING"
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already requested a visit for this property"
      })
    }

    const booking = await Booking.create({
      user: req.user._id,
      property: propertyId,
      agent: property.createdBy,
      date: new Date(date),
      status: "PENDING"
    })

    res.status(201).json({
      success: true,
      message: "Visit booked successfully",
      booking
    })

    // ✅ SAFE SOCKET EMIT
    if (global.io) {
      global.io.to("admin-room").emit("dashboard:update", {
        type: "BOOKING_CREATED",
        message: "New booking request",
        time: new Date()
      })

      global.io.to("agent-room").emit("agent:update", {
        type: "BOOKING_CREATED",
        message: "New booking received",
        time: new Date()
      })
    }

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// USER: MY BOOKINGS
// ============================
exports.getUserBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({
      user: req.user._id
    })
      .populate("property", "title city price")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      bookings
    })

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// AGENT: GET BOOKINGS (OPTIMIZED)
// ============================
exports.getAgentBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({
      agent: req.user._id
    })
      .populate("user", "name email")
      .populate("property", "title city price")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      bookings
    })

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// AGENT: UPDATE BOOKING STATUS
// ============================
exports.updateBookingStatus = async (req, res) => {
  try {

    const { id } = req.params
    const { status } = req.body

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      })
    }

    if (!status || !ALLOWED_STATUS.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      })
    }

    const booking = await Booking.findById(id).populate("property")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      })
    }

    if (booking.property.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      })
    }

    booking.status = status.toUpperCase()
    await booking.save()

    res.json({
      success: true,
      message: "Booking updated",
      booking
    })

    if (global.io) {
      global.io.to("admin-room").emit("dashboard:update", {
        type: "BOOKING_UPDATED",
        message: `Booking ${booking.status}`,
        time: new Date()
      })
    }

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}