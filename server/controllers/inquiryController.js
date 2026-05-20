const mongoose = require("mongoose")
const Inquiry = require("../models/Inquiry")
const Property = require("../models/Property")

// ============================
// HELPERS
// ============================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const ALLOWED_STATUS = ["PENDING", "CONTACTED", "RESOLVED"]

const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone) // simple India-safe validation


// ============================
// CREATE INQUIRY (User)
// ============================
exports.createInquiry = async (req, res) => {
  try {

    const { message, phone } = req.body
    const { propertyId } = req.params

    if (!isValidId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      })
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Message is too short"
      })
    }

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number"
      })
    }

    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    const existingInquiry = await Inquiry.findOne({
      user: req.user._id,
      property: propertyId
    })

    if (existingInquiry) {
      return res.status(400).json({
        success: false,
        message: "You have already sent an inquiry for this property"
      })
    }

    const inquiry = await Inquiry.create({
      message: message.trim(),
      phone,
      user: req.user._id,
      property: propertyId,
      agent: property.createdBy,
      status: "PENDING"
    })

    return res.status(201).json({
      success: true,
      message: "Inquiry sent successfully",
      inquiry
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// GET INQUIRIES (Agent)
// ============================
exports.getAgentInquiries = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 10

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit

    const [inquiries, total] = await Promise.all([

      Inquiry.find({ agent: req.user._id })
        .populate("user", "name email phone")
        .populate("property", "title price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Inquiry.countDocuments({ agent: req.user._id })
    ])

    return res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      inquiries
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// GET ALL INQUIRIES (Admin)
// ============================
exports.getAllInquiries = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 10

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit

    const [inquiries, total] = await Promise.all([

      Inquiry.find()
        .populate("user", "name email")
        .populate("agent", "name email")
        .populate("property", "title price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Inquiry.countDocuments()
    ])

    return res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      inquiries
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// UPDATE INQUIRY STATUS
// ============================
exports.updateInquiryStatus = async (req, res) => {
  try {

    const { id } = req.params
    const { status } = req.body

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID"
      })
    }

    if (!status || !ALLOWED_STATUS.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      })
    }

    const inquiry = await Inquiry.findById(id)

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      })
    }

    // Agent restriction
    if (
      req.user.role === "agent" &&
      inquiry.agent.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      })
    }

    inquiry.status = status.toUpperCase()
    await inquiry.save()

    return res.status(200).json({
      success: true,
      message: "Inquiry status updated",
      inquiry
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}