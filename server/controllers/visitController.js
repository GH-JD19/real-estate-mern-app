const Visit = require("../models/Visit")
const Property = require("../models/Property")

// ========================
// BOOK VISIT (USER)
// ========================
exports.bookVisit = async (req, res) => {

  try {

    const { visitDate, message } = req.body
    const propertyId = req.params.propertyId

    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    // 🔴 Prevent duplicate visit request
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
      visitDate,
      message
    })

    res.status(201).json({
      success: true,
      visit
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}


// ========================
// USER VISITS
// ========================
exports.getUserVisits = async (req, res) => {

  try {

    const visits = await Visit.find({
      user: req.user._id
    })
      .populate("property", "title price")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      visits
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}


// ========================
// AGENT VISITS
// ========================
exports.getAgentVisits = async (req, res) => {

  try {

    const visits = await Visit.find({
      agent: req.user._id
    })
      .populate("user", "name email phone")
      .populate("property", "title price")
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      visits
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}


// ========================
// UPDATE STATUS
// ========================
exports.updateVisitStatus = async (req, res) => {

  try {

    const visit = await Visit.findById(req.params.id)

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found"
      })
    }

    visit.status = req.body.status.toUpperCase()

    await visit.save()

    res.json({
      success: true,
      message: "Visit updated",
      visit
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}


// ========================
// ADMIN VISIT
// ========================
exports.getAllVisits = async (req, res) => {

  try {

    const visits = await Visit.find()
      .populate("user", "name email")
      .populate("property", "title price")
      .populate("agent", "name")

    res.status(200).json({
      success: true,
      visits
    })

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}