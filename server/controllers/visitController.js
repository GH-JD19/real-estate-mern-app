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

    // 🔥 REAL-TIME EMIT (Agent + Admin)
    global.io.to("agent-room").emit("visitUpdated", visit)
    global.io.to("admin-room").emit("visitUpdated", visit)

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
// USER VISITS (OPTIONAL PAGINATION)
// ========================
exports.getUserVisits = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const query = { user: req.user._id }

    const total = await Visit.countDocuments(query)

    const visits = await Visit.find(query)
      .populate("property", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      visits,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ========================
// AGENT VISITS (WITH PAGINATION ✅)
// ========================
exports.getAgentVisits = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page - 1) * limit

    const query = { agent: req.user._id }

    const total = await Visit.countDocuments(query)

    const visits = await Visit.find(query)
      .populate("user", "name email phone")
      .populate("property", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      visits,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ========================
// UPDATE STATUS (WITH SOCKET ✅)
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

    // 🔥 REAL-TIME UPDATE (Agent + Admin + User)
    global.io.to("agent-room").emit("visitUpdated", visit)
    global.io.to("admin-room").emit("visitUpdated", visit)
    global.io.to(`user-${visit.user}`).emit("visitUpdated", visit)

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
// ADMIN VISITS (WITH PAGINATION ✅)
// ========================
exports.getAllVisits = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Visit.countDocuments()

    const visits = await Visit.find()
      .populate("user", "name email")
      .populate("property", "title price")
      .populate("agent", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      visits,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}