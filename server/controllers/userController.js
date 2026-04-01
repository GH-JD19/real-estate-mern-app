const User = require("../models/User")
const Property = require("../models/Property")
const Booking = require("../models/Booking")

// ================= USER REQUEST AGENT =================
exports.requestAgent = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ success:false, message: "User not found" })
    }

    if (user.role === "agent") {
      return res.status(400).json({ success:false, message: "Already an agent" })
    }

    user.isAgentRequested = true
    await user.save()

    // 🔥 REAL-TIME
    global.io.to("admin-room").emit("dashboard:update", {
      type: "AGENT_REQUEST",
      message: `${user.name} requested agent access`,
      time: new Date()
    })

    res.json({ success:true, message: "Agent request submitted" })

  } catch (err) {
    res.status(500).json({ success:false, message: err.message })
  }
}


exports.approveAgent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success:false, message: "User not found" })
    }

    user.role = "agent"
    user.agentApproved = true
    user.isAgentRequested = false
    await user.save()

    // 🔥 REAL-TIME
    global.io.to("admin-room").emit("dashboard:update", {
      type: "AGENT_APPROVED",
      message: `${user.name} approved as agent`,
      time: new Date()
    })

    res.json({ success:true, message: "Agent approved successfully" })

  } catch (err) {
    res.status(500).json({ success:false, message: err.message })
  }
}


// ================= ADMIN APPROVE AGENT =================
exports.approveAgent = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success:false, message: "User not found" })
    }

    user.role = "agent"
    user.agentApproved = true
    user.isAgentRequested = false

    await user.save()

    res.json({
      success:true,
      message: "Agent approved successfully"
    })

  } catch (err) {
    res.status(500).json({ success:false, message: err.message })
  }
}


// ================= ADMIN GET AGENT REQUESTS =================
exports.getAgentRequests = async (req, res) => {
  try {

    const users = await User.find({ isAgentRequested: true })

    res.json({
      success:true,
      users
    })

  } catch (err) {
    res.status(500).json({ success:false, message: err.message })
  }
}


// ================= USER DASHBOARD STATS =================
exports.getUserDashboardStats = async (req, res) => {
  try {

    const userId = req.user._id

    // Always fetch fresh user
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    // Safe wishlist count
    const wishlist = user.wishlist ? user.wishlist.length : 0

    // Visits count (Booking model)
    const visits = await Booking.countDocuments({
      user: userId
    })

    // Profile completion calculation
    let profileComplete = 0

    if (user.name) profileComplete += 25
    if (user.email) profileComplete += 25
    if (user.phone) profileComplete += 25
    if (user.address) profileComplete += 25

    res.status(200).json({
      success: true,
      wishlist,
      visits,
      profileComplete
    })

  } catch (err) {

    console.log("USER DASHBOARD ERROR 👉", err)

    res.status(500).json({
      success: false,
      message: "Server Error"
    })

  }
}


// ================= USER PROFILE =================
exports.getUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    res.json({
      success: true,
      user
    })

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    })

  }
}


// ================= UPDATE USER PROFILE =================
exports.updateUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    user.name = req.body.name || user.name
    user.phone = req.body.phone || user.phone
    user.address = req.body.address || user.address

    // ⭐ Cloudinary Image
    if (req.file) {
      user.photo = req.file.path
    }

    await user.save()

    res.json({
      success: true,
      user
    })

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    })

  }
}