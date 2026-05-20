const mongoose = require("mongoose")
const Visit = require("../models/Visit")
const Property = require("../models/Property")

// ============================
// HELPERS
// ============================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const ALLOWED_STATUS = ["PENDING", "APPROVED", "REJECTED"]

const safeEmit = (room, event, payload) => {
  if (global.io) {
    global.io.to(room).emit(event, payload)
  }
}


// ========================
// BOOK VISIT (USER)
// ========================
exports.bookVisit = async (req, res) => {
  try {

    const { visitDate, message } = req.body
    const { propertyId } = req.params

    if (!isValidId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      })
    }

    if (!visitDate || new Date(visitDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid visit date"
      })
    }

    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    const existingVisit = await Visit.findOne({
      property: propertyId,
      user: req.user._id,
      status: "PENDING"
    })

    if (existingVisit) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending visit for this property"
      })
    }

    const visit = await Visit.create({
      property: propertyId,
      user: req.user._id,
      agent: property.createdBy,
      visitDate: new Date(visitDate),
      message: message?.trim()
    })

    safeEmit("agent-room", "visitUpdated", visit)
    safeEmit("admin-room", "visitUpdated", visit)

    res.status(201).json({
      success: true,
      visit
    })

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ========================
// USER VISITS
// ========================
exports.getUserVisits = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 10

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit
    const query = { user: req.user._id }

    const [visits, total] = await Promise.all([
      Visit.find(query)
        .populate("property", "title price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Visit.countDocuments(query)
    ])

    res.json({
      success: true,
      visits,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    })

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ========================
// AGENT VISITS
// ========================
exports.getAgentVisits = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 5

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit
    const query = { agent: req.user._id }

    const [visits, total] = await Promise.all([
      Visit.find(query)
        .populate("user", "name email phone")
        .populate("property", "title price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Visit.countDocuments(query)
    ])

    res.json({
      success: true,
      visits,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    })

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ========================
// UPDATE STATUS
// ========================
exports.updateVisitStatus = async (req, res) => {
  try {

    const { id } = req.params
    const { status } = req.body

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visit ID"
      })
    }

    if (!ALLOWED_STATUS.includes(status?.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      })
    }

    const visit = await Visit.findById(id).populate("property")

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found"
      })
    }

    // 🔐 Only agent owner can update
    if (visit.property.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      })
    }

    visit.status = status.toUpperCase()
    await visit.save()

    safeEmit("agent-room", "visitUpdated", visit)
    safeEmit("admin-room", "visitUpdated", visit)
    safeEmit(`user-${visit.user}`, "visitUpdated", visit)

    res.json({
      success: true,
      message: "Visit updated",
      visit
    })

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ========================
// ADMIN VISITS
// ========================
exports.getAllVisits = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 10

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit

    const [visits, total] = await Promise.all([
      Visit.find()
        .populate("user", "name email")
        .populate("property", "title price")
        .populate("agent", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Visit.countDocuments()
    ])

    res.json({
      success: true,
      visits,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    })

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}