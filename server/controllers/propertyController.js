const mongoose = require("mongoose")
const asyncHandler = require("../utils/asyncHandler")
const getOptimizedImage = require("../utils/getOptimizedImage")
const Property = require("../models/Property")
const Notification = require("../models/Notification")

// ============================
// HELPERS
// ============================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const ALLOWED_STATUS = ["PENDING", "APPROVED", "REJECTED"]

const safeEmit = (room, event, payload) => {
  if (global.io) {
    global.io.to(room).emit(event, payload)
  }
}


exports.createProperty = asyncHandler(async (req, res) => {

  const imageUrls = []

  if (req.files?.length) {
    req.files.forEach(file => {
      if (file.path) imageUrls.push(getOptimizedImage(file.path))
      else if (file.secure_url) imageUrls.push(file.secure_url)
    })
  }

  // 🔐 Prevent unwanted fields
  delete req.body.createdBy
  delete req.body.status
  delete req.body.isDeleted

  const property = await Property.create({

    ...req.body,

    // ✅ Safe conversions
    price: Number(req.body.price) || 0,
    pincode: Number(req.body.pincode) || null,
    bedrooms: Number(req.body.bedrooms) || 0,
    bathrooms: Number(req.body.bathrooms) || 0,
    balconies: Number(req.body.balconies) || 0,
    area: Number(req.body.area) || 0,
    floor: Number(req.body.floor) || null,
    totalFloors: Number(req.body.totalFloors) || null,
    maintenanceCharge: Number(req.body.maintenanceCharge) || 0,

    // ✅ Normalize strings
    purpose: req.body.purpose?.toUpperCase() || "SELL",
    type: req.body.type?.toUpperCase() || "APARTMENT",
    city: req.body.city?.toUpperCase() || "",
    state: req.body.state?.toUpperCase() || "",
    address: req.body.address?.toUpperCase() || "",

    furnishing: req.body.furnishing?.toUpperCase(),
    parking: req.body.parking?.toUpperCase(),
    propertyAge: req.body.propertyAge?.toUpperCase(),
    facing: req.body.facing?.toUpperCase(),

    // ✅ GEO FIX (CORRECT FORMAT)
    location: {
      type: "Point",
      coordinates: [
        Number(req.body.lng) || 0,
        Number(req.body.lat) || 0
      ]
    },

    amenities: req.body.amenities || [],
    media: { images: imageUrls },

    createdBy: req.user._id,
    listedByRole: req.user.role?.toUpperCase() || "OWNER",
    status: "PENDING"
  })

  res.status(201).json({
    success: true,
    message: "Property created successfully",
    property
  })

  // 🔔 Notification (non-blocking)
  await Notification.create({
    role: "admin",
    type: "PROPERTY_CREATED",
    message: "New property submitted"
  })

  safeEmit("admin-room", "dashboard:update", {
    type: "PROPERTY_CREATED",
    message: "New property submitted",
    time: new Date()
  })
})


// ============================
// GET MY PROPERTIES
// ============================
exports.getMyProperties = async (req, res) => {
  try {

    if (!req.user?._id) {
      return res.status(401).json({ success: false })
    }

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 6

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit

    const filter = { createdBy: req.user._id }

    if (req.query.status) {
      filter.status = req.query.status.toUpperCase()
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Property.countDocuments(filter)
    ])

    res.json({
      success: true,
      properties,
      total,
      page,
      pages: Math.ceil(total / limit)
    })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// GET PROPERTIES (PUBLIC)
// ============================
exports.getProperties = asyncHandler(async (req, res) => {

  let page = Number(req.query.page) || 1
  let limit = Number(req.query.limit) || 10

  page = page < 1 ? 1 : page
  limit = limit > 50 ? 50 : limit

  const skip = (page - 1) * limit

  const query = { status: "APPROVED" }

  
  if (req.query.search) {
    query.$text = { $search: req.query.search }
  }

  if (req.query.type) {
    query.type = req.query.type.toUpperCase()
  }

  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {}
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice)
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice)
  }

  let sortOption = { createdAt: -1 }
  if (req.query.sort === "price_asc") sortOption = { price: 1 }
  if (req.query.sort === "price_desc") sortOption = { price: -1 }

  const [properties, total] = await Promise.all([
    Property.find({ ...query, isDeleted: false })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean(),
    Property.countDocuments(query)
  ])

  res.json({
    success: true,
    page,
    pages: Math.ceil(total / limit),
    total,
    properties
  })
})


// ============================
// GET SINGLE PROPERTY
// ============================
exports.getSingleProperty = async (req, res) => {
  try {

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false })
    }

    const property = await Property.findById(req.params.id)
      .populate("createdBy", "name email role")
      .lean()

    if (!property) {
      return res.status(404).json({ success: false })
    }

    res.json({ success: true, property })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// GET FEATURED PROPERTIES
// ============================
exports.getFeaturedProperties = async (req, res) => {
  try {

    const properties = await Property.find({
      status: "APPROVED",
      featured: true,
      featuredTill: { $gte: new Date() }
    })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()

    res.json({ success: true, properties })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// UPDATE PROPERTY
// ============================
exports.updateProperty = async (req, res) => {
  try {

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false })
    }

    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({ success: false })
    }

    // ================= ROLE + STATUS LOGIC =================

    if (req.user.role === "agent") {

      // ❌ Not owner
      if (property.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized"
        })
      }

      // ❌ Cannot edit pending
      if (property.status === "PENDING") {
        return res.status(400).json({
          success: false,
          message: "Cannot edit property while pending approval"
        })
      }

    }

    if (req.user.role === "admin") {

      // ❌ Cannot edit pending
      if (property.status === "PENDING") {
        return res.status(400).json({
          success: false,
          message: "Admin cannot edit pending properties"
        })
      }

      // ❌ Cannot edit rejected (optional but recommended)
      if (property.status === "REJECTED") {
        return res.status(400).json({
          success: false,
          message: "Admin cannot edit rejected properties"
        })
      }
    }

    // ================= SAFE UPDATE =================

    delete req.body.createdBy
    delete req.body.status

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      req.body, {
      new: true,
      runValidators: true
    })

    res.json({
      success: true,
      property: updated
    })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// DELETE PROPERTY
// ============================
exports.deleteProperty = async (req, res) => {
  try {

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false })
    }

    const property = await Property.findById(req.params.id)

    if (!property) return res.status(404).json({ success: false })

    if (
      req.user.role === "agent" &&
      property.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false })
    }

    property.isDeleted = true
    await property.save()

    res.json({ success: true })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// UPDATE PROPERTY STATUS (Agent)
// ============================
exports.updatePropertyStatus = async (req, res) => {
  try {

    const { status } = req.body

    if (!ALLOWED_STATUS.includes(status?.toUpperCase())) {
      return res.status(400).json({ success: false })
    }

    const property = await Property.findById(req.params.id)

    if (!property) return res.status(404).json({ success: false })

    property.status = status.toUpperCase()
    await property.save()

    res.json({ success: true, property })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// ADMIN: GET ALL PROPERTIES
// ============================
exports.adminGetAllProperties = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 10

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit

    const filter = {}

    if (req.query.search) {
      const safe = escapeRegex(req.query.search)
      filter.title = { $regex: safe, $options: "i" }
    }

    if (req.query.status) {
      filter.status = req.query.status.toUpperCase()
    }

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(filter)
    ])

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      properties
    })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// ADMIN: DELETE PROPERTY
// ============================
exports.adminDeleteProperty = async (req, res) => {
  try {

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false })
    }

    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ success: false })

    property.isDeleted = true
    await property.save()

    res.json({ success: true })

    safeEmit("admin-room", "dashboard:update", {
      type: "PROPERTY_DELETED",
      message: "Property deleted",
      time: new Date()
    })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// ADMIN: UPDATE PROPERTY STATUS
// ============================
exports.adminUpdatePropertyStatus = async (req, res) => {
  try {

    const { status } = req.body

    if (!ALLOWED_STATUS.includes(status?.toUpperCase())) {
      return res.status(400).json({ success: false })
    }

    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ success: false })

    property.status = status.toUpperCase()
    await property.save()

    res.json({ success: true, property })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// GET ADMIN PROPERTIES (LIGHT LIST)
// ============================
exports.getAdminProperties = async (req, res) => {
  try {

    let limit = Number(req.query.limit) || 20
    limit = limit > 100 ? 100 : limit // safety cap

    const properties = await Property.find()
      .select("title price status createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return res.json({
      success: true,
      count: properties.length,
      properties
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// APPROVE PROPERTY
// ============================
exports.approveProperty = async (req, res) => {
  try {

    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ success: false })

    property.status = "APPROVED"
    await property.save()

    await Notification.create({
      userId: property.createdBy,
      role: "user",
      type: "PROPERTY_APPROVED",
      message: "Your property has been approved"
    })

    safeEmit("admin-room", "dashboard:update", {
      type: "PROPERTY_APPROVED",
      message: "Property approved",
      time: new Date()
    })

    safeEmit(`user-${property.createdBy}`, "user:update", {
      message: "Your property has been approved",
      time: new Date()
    })

    res.json({ success: true })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// REJECT PROPERTY
// ============================
exports.rejectProperty = async (req, res) => {
  try {

    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ success: false })

    property.status = "REJECTED"
    await property.save()

    res.json({ success: true })

    safeEmit("admin-room", "dashboard:update", {
      type: "PROPERTY_REJECTED",
      message: "Property rejected",
      time: new Date()
    })

    safeEmit(`user-${property.createdBy}`, "user:update", {
      message: "Your property has been rejected",
      time: new Date()
    })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// AGENT: GET MY LISTINGS
// ============================
exports.getAgentProperties = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 6

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit

    const query = {
      createdBy: req.user._id,
      status: "APPROVED"
    }

    const [properties, total] = await Promise.all([
      Property.find({ ...query, isDeleted: false })
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(query)
    ])

    res.json({
      success: true,
      properties,
      page,
      pages: Math.ceil(total / limit),
      total
    })

  } catch {
    res.status(500).json({ success: false })
  }
}


// ============================
// ADMIN: TOGGLE FEATURED
// ============================
exports.toggleFeatured = async (req, res) => {
  try {

    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ success: false })

    property.featured = !property.featured

    if (property.featured) {
      const date = new Date()
      date.setDate(date.getDate() + 30)
      property.featuredTill = date
    } else {
      property.featuredTill = null
    }

    await property.save()

    res.json({
      success: true,
      featured: property.featured
    })

  } catch {
    res.status(500).json({ success: false })
  }
}