const Booking = require("../models/Booking")
const Property = require("../models/Property")

// ============================
// USER: CREATE BOOKING
// ============================
exports.createBooking = async (req, res) => {
  try {

    const { propertyId, date } = req.body

    // Check property exists
    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    // Prevent duplicate booking
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
      date,
      status: "PENDING"
    })

    res.status(201).json({
      success: true,
      message: "Visit booked successfully",
      booking
    })

    global.io.to("admin-room").emit("dashboard:update", {
      type: "BOOKING_CREATED",
      message: "New booking request",
      time: new Date()
    })

    // ✅ NOTIFY AGENT
    global.io.to("agent-room").emit("agent:update", {
      type: "BOOKING_CREATED",
      message: "New booking received",
      time: new Date()
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
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

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }
}


// ============================
// AGENT: GET BOOKINGS
// ============================
exports.getAgentBookings = async (req, res) => {
  try {

    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate({
        path: "property",
        match: { createdBy: req.user._id },
        select: "title city price"
      })
      .sort({ createdAt: -1 })

    // Remove bookings where property doesn't belong to agent
    const filtered = bookings.filter(b => b.property)

    res.json({
      success: true,
      bookings: filtered
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }
}


// ============================
// AGENT: UPDATE BOOKING STATUS
// ============================
exports.updateBookingStatus = async (req, res) => {
  try {

    const { status } = req.body

    const booking = await Booking.findById(req.params.id)
      .populate("property")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      })
    }

    // Security: Only property owner agent can update
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

    global.io.to("admin-room").emit("dashboard:update", {
      type: "BOOKING_UPDATED",
      message: `Booking ${status}`,
      time: new Date()
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }
}