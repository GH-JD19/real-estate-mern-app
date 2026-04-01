const Property = require("../models/Property")
const Notification = require("../models/Notification")

// ============================
// CREATE PROPERTY
// ============================
exports.createProperty = async (req, res) => {
  try {

    const imageUrls = []

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.path) imageUrls.push(file.path)
        else if (file.secure_url) imageUrls.push(file.secure_url)
      })
    }

    const property = await Property.create({

      ...req.body,

      // NUMERIC FIELDS
      price: req.body.price ? Number(req.body.price) : 0,
      pincode: req.body.pincode ? Number(req.body.pincode) : null,
      bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : 0,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : 0,
      balconies: req.body.balconies ? Number(req.body.balconies) : 0,
      area: req.body.area ? Number(req.body.area) : 0,
      floor: req.body.floor ? Number(req.body.floor) : null,
      totalFloors: req.body.totalFloors ? Number(req.body.totalFloors) : null,
      maintenanceCharge: req.body.maintenanceCharge ? Number(req.body.maintenanceCharge) : 0,

      // ENUM FORMAT
      purpose: req.body.purpose ? req.body.purpose.toUpperCase() : "SELL",
      type: req.body.type ? req.body.type.toUpperCase() : "APARTMENT",
      city: req.body.city ? req.body.city.toUpperCase() : "",
      state: req.body.state ? req.body.state.toUpperCase() : "",
      address: req.body.address ? req.body.address.toUpperCase() : "",
      furnishing: req.body.furnishing ? req.body.furnishing.toUpperCase() : undefined,
      parking: req.body.parking ? req.body.parking.toUpperCase() : undefined,
      propertyAge: req.body.propertyAge ? req.body.propertyAge.toUpperCase() : undefined,
      facing: req.body.facing ? req.body.facing.toUpperCase() : undefined,

      // LOCATION
      location: {
        lat: req.body.lat ? Number(req.body.lat) : null,
        lng: req.body.lng ? Number(req.body.lng) : null
      },

      // AMENITIES
      amenities: req.body.amenities || [],

      // MEDIA
      media: {
        images: imageUrls
      },

      createdBy: req.user._id,
      listedByRole: req.user.role?.toUpperCase() || "OWNER",
      status: "PENDING"
    })

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property
    })

    await Notification.create({
      role: "admin",
      type: "PROPERTY_CREATED",
      message: "New property submitted"
    })

    global.io.to("admin-room").emit("dashboard:update", {
      type: "PROPERTY_CREATED",
      message: "New property submitted",
      time: new Date()
    })

  } catch (error) {
    console.log("CREATE PROPERTY ERROR 👉", error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ============================
// GET MY PROPERTIES (User / Agent) WITH PAGINATION
// ============================
exports.getMyProperties = async (req, res) => {
  try {

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      })
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 6
    const skip = (page - 1) * limit

    const filter = {
      createdBy: req.user._id
    }

    // Optional status filter
    if (req.query.status && req.query.status !== "") {
      filter.status = req.query.status.toUpperCase()
    }

    const total = await Property.countDocuments(filter)

    const properties = await Property.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      properties,
      total,
      page,
      pages: Math.ceil(total / limit)
    })

  } catch (error) {

    console.log("getMyProperties error:", error)

    res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
}


// ============================
// GET ALL PROPERTIES (Public)
// ============================
exports.getProperties = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    let filter = {
      status: "APPROVED"
    }

    if (req.query.city) filter.city = req.query.city.toUpperCase()
    if (req.query.purpose) filter.purpose = req.query.purpose.toUpperCase()
    if (req.query.status) filter.status = req.query.status.toUpperCase()

    if (req.query.search) {
      filter.$text = { $search: req.query.search }
    }

    const total = await Property.countDocuments(filter)

    const properties = await Property.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      properties
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ============================
// GET SINGLE PROPERTY
// ============================
exports.getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("createdBy", "name email role")

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    res.status(200).json({
      success: true,
      property
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
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
        featuredTill: { $exists: true, $gte: new Date() }
      })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .limit(6)

    res.status(200).json({
      success: true,
      properties
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ============================
// UPDATE PROPERTY (Agent/Admin)
// ============================
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    if (
      req.user.role === "agent" &&
      property.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      })
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ============================
// DELETE PROPERTY (Agent/Admin)
// ============================
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    if (
      req.user.role === "agent" &&
      property.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      })
    }

    await property.deleteOne()

    res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ============================
// UPDATE PROPERTY STATUS (Agent)
// ============================
exports.updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body

    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    property.status = status.toUpperCase()
    await property.save()

    res.status(200).json({
      success: true,
      message: "Property status updated",
      property
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ============================
// ADMIN: GET ALL PROPERTIES
// ============================
exports.adminGetAllProperties = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = {}

    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: "i" }
    }

    if (req.query.status) {
      filter.status = req.query.status.toUpperCase()
    }

    const total = await Property.countDocuments(filter)

    const properties = await Property.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      properties
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ============================
// ADMIN: DELETE PROPERTY
// ============================
exports.adminDeleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    await property.deleteOne()

    res.status(200).json({
      success: true,
      message: "Property deleted by admin"
    })

    global.io.to("admin-room").emit("dashboard:update", {
      type: "PROPERTY_DELETED",
      message: "Property deleted by admin",
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
// ADMIN: UPDATE PROPERTY STATUS
// ============================
exports.adminUpdatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body

    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    property.status = status.toUpperCase()
    await property.save()

    res.status(200).json({
      success: true,
      message: "Property status updated by admin",
      property
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ============================
// GET ADMIN PROPERTIES (FILTER)
// ============================
exports.getAdminProperties = async (req, res) => {
  try {
    const properties = await Property.find()
    res.json({ success: true, properties })
  } catch (error) {
    console.log("ADMIN PROPERTIES ERROR 👉", error)
    res.status(500).json({ success: false })
  }
}


// ============================
// APPROVE PROPERTY
// ============================
exports.approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({ success: false })
    }

    property.status = "APPROVED"
    await property.save()

    // ✅ SAVE FIRST
    await Notification.create({
      userId: property.createdBy.toString(),
      role: "user",
      type: "PROPERTY_APPROVED",
      message: "Your property has been approved"
    })

    // ✅ EMIT TO ADMIN
    global.io.to("admin-room").emit("dashboard:update", {
      type: "PROPERTY_APPROVED",
      message: "Property approved",
      time: new Date()
    })

    // ✅ EMIT TO USER (FIXED)
    global.io.to(`user-${property.createdBy}`).emit("user:update", {
      type: "PROPERTY_APPROVED",
      message: "Your property has been approved",
      time: new Date()
    })

    // ✅ SEND RESPONSE LAST
    res.json({ success: true })

  } catch (error) {
    res.status(500).json({ success: false })
  }
}


// ============================
// REJECT PROPERTY
// ============================
exports.rejectProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({ success:false })
    }

    property.status = "REJECTED"
    await property.save()

    res.json({ success:true })

    global.io.to("admin-room").emit("dashboard:update", {
      type: "PROPERTY_REJECTED",
      message: "Property rejected",
      time: new Date()
    })

    // ✅ ADD THIS
    global.io.to(`user-${property.createdBy}`).emit("user:update", {
      message: "Your property has been rejected",
      time: new Date()
    })

  } catch (error) {
    res.status(500).json({ success:false })
  }
}

// ============================
// AGENT: GET MY LISTINGS (WITH PAGINATION)
// ============================
exports.getAgentProperties = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 6
    const skip = (page - 1) * limit

    const query = {
        createdBy: req.user._id,
        status: "APPROVED"
      }

      const total = await Property.countDocuments(query)

      const properties = await Property.find(query)
      
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      properties,
      page,
      pages: Math.ceil(total / limit),
      total
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ============================
// ADMIN: TOGGLE FEATURED
// ============================
exports.toggleFeatured = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    property.featured = !property.featured

    if (property.featured) {
      const date = new Date()
      date.setDate(date.getDate() + 30)
      property.featuredTill = date
    } else {
      property.featuredTill = null
    }

    await property.save()

    res.status(200).json({
      success: true,
      featured: property.featured
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}