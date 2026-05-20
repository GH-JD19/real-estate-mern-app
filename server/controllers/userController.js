const mongoose = require("mongoose")
const User = require("../models/User")
const Booking = require("../models/Booking")

// ============================
// HELPERS
// ============================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const safeEmit = (room, event, payload) => {
  if (global.io) {
    global.io.to(room).emit(event, payload)
  }
}

const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone)


// ================= USER REQUEST AGENT =================
exports.requestAgent = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ success:false })
    }

    if (user.role === "agent") {
      return res.status(400).json({ success:false })
    }

    user.isAgentRequested = true
    await user.save()

    safeEmit("admin-room", "dashboard:update", {
      type: "AGENT_REQUEST",
      message: `${user.name} requested agent access`,
      time: new Date()
    })

    res.json({ success:true, message: "Agent request submitted" })

  } catch {
    res.status(500).json({ success:false, message: "Server error" })
  }
}


// ================= ADMIN APPROVE AGENT =================
exports.approveAgent = async (req, res) => {
  try {

    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({ success:false })
    }

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ success:false })
    }

    user.role = "agent"
    user.agentApproved = true
    user.isAgentRequested = false

    await user.save()

    safeEmit("admin-room", "dashboard:update", {
      type: "AGENT_APPROVED",
      message: `${user.name} approved as agent`,
      time: new Date()
    })

    res.json({
      success:true,
      message: "Agent approved successfully"
    })

  } catch {
    res.status(500).json({ success:false, message: "Server error" })
  }
}


// ================= ADMIN GET AGENT REQUESTS =================
exports.getAgentRequests = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 10

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find({ isAgentRequested: true })
        .select("name email phone createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments({ isAgentRequested: true })
    ])

    res.json({
      success:true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users
    })

  } catch {
    res.status(500).json({ success:false, message: "Server error" })
  }
}


// ================= USER DASHBOARD STATS =================
exports.getUserDashboardStats = async (req, res) => {
  try {

    const userId = req.user._id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success:false })
    }

    const [visits] = await Promise.all([
      Booking.countDocuments({ user: userId })
    ])

    const wishlist = user.wishlist?.length || 0

    let profileComplete = 0
    if (user.name) profileComplete += 25
    if (user.email) profileComplete += 25
    if (user.phone) profileComplete += 25
    if (user.address) profileComplete += 25

    res.json({
      success: true,
      wishlist,
      visits,
      profileComplete
    })

  } catch {
    res.status(500).json({ success:false, message: "Server error" })
  }
}


// ================= USER PROFILE =================
exports.getUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .select("-password")

    if (!user) {
      return res.status(404).json({ success:false })
    }

    res.json({ success: true, user })

  } catch {
    res.status(500).json({ success:false, message: "Server error" })
  }
}


// ================= UPDATE USER PROFILE =================
exports.updateUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ success:false })
    }

    if (req.body.name) user.name = req.body.name

    if (req.body.phone) {
      if (!isValidPhone(req.body.phone)) {
        return res.status(400).json({
          success:false,
          message: "Invalid phone number"
        })
      }
      user.phone = req.body.phone
    }

    if (req.body.address) user.address = req.body.address

    if (req.file) {
      user.photo = req.file.path
    }

    await user.save()

    res.json({
      success: true,
      user
    })

  } catch {
    res.status(500).json({ success:false, message: "Server error" })
  }
}