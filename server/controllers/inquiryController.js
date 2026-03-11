const Inquiry = require("../models/Inquiry")
const Property = require("../models/Property")

// ============================
// CREATE INQUIRY (User)
// ============================
exports.createInquiry = async (req, res) => {
  try {

    const { message, phone } = req.body
    const propertyId = req.params.propertyId

    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    // prevent duplicate inquiry
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
      message,
      phone,
      user: req.user._id,
      property: propertyId,
      agent: property.createdBy
    })

    res.status(201).json({
      success: true,
      message: "Inquiry sent successfully",
      inquiry
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }
}


// ============================
// GET INQUIRIES (Agent)
// ============================
exports.getAgentInquiries = async (req, res) => {
  try {

    const inquiries = await Inquiry.find({
      agent: req.user._id
    })
      .populate("user", "name email phone")
      .populate("property", "title price")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      total: inquiries.length,
      inquiries
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }
}


// ============================
// GET ALL INQUIRIES (Admin)
// ============================
exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("user", "name email")
      .populate("agent", "name email")
      .populate("property", "title price")

    res.status(200).json({
      success: true,
      total: inquiries.length,
      inquiries
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ============================
// UPDATE INQUIRY STATUS
// ============================
exports.updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      })
    }

    // Agent can update only their inquiry
    if (
      req.user.role === "agent" &&
      inquiry.agent.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      })
    }

    inquiry.status = req.body.status.toUpperCase()
    await inquiry.save()

    res.status(200).json({
      success: true,
      message: "Inquiry status updated",
      inquiry
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}