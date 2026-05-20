const mongoose = require("mongoose")
const User = require("../models/User")
const Property = require("../models/Property")
const Booking = require("../models/Booking")
const sendEmail = require("../utils/sendEmail")

// ============================
// HELPERS
// ============================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")


// ============================
// GET ADMIN DASHBOARD STATS
// ============================
const getAdminStats = async (req, res) => {
  try {

    const [
      totalUsers,
      totalAgents,
      blockedUsers,
      totalProperties,
      pendingProperties,
      totalBookings
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "agent" }),
      User.countDocuments({ isBlocked: true }),
      Property.countDocuments(),
      Property.countDocuments({ status: "PENDING" }), // ✅ FIXED
      Booking.countDocuments()
    ])

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAgents,
        blockedUsers,
        totalProperties,
        pendingProperties,
        totalBookings
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// GET ADMIN CHART DATA
// ============================
const getAdminChartData = async (req, res) => {
  try {

    const [
      userGrowth,
      agentGrowth,
      propertyGrowth,
      pendingGrowth,
      blockedGrowth,
      bookingGrowth
    ] = await Promise.all([

      User.aggregate([
        { $match: { role: "user" } },
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
      ]),

      User.aggregate([
        { $match: { role: "agent" } },
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
      ]),

      Property.aggregate([
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
      ]),

      Property.aggregate([
        { $match: { status: "PENDING" } }, // ✅ FIXED
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
      ]),

      User.aggregate([
        { $match: { isBlocked: true } },
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
      ]),

      Booking.aggregate([
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
      ])
    ])

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    const chartData = months.map((month, index) => {
      const m = index + 1

      return {
        name: month,
        users: userGrowth.find(u => u._id === m)?.total || 0,
        agents: agentGrowth.find(a => a._id === m)?.total || 0,
        properties: propertyGrowth.find(p => p._id === m)?.total || 0,
        pending: pendingGrowth.find(p => p._id === m)?.total || 0,
        bookings: bookingGrowth.find(b => b._id === m)?.total || 0
      }
    })

    return res.status(200).json({
      success: true,
      chartData
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// GET ALL USERS (FINAL SAFE)
// ============================
const getAllUsers = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 6
    const search = req.query.search || ""

    // ✅ SAFE LIMITS
    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const filter = {}

    if (search) {
      const safeSearch = escapeRegex(search)
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } }
      ]
    }

    if (req.query.role === "agent" || req.query.role === "user") {
      filter.role = req.query.role
    }

    if (req.query.blocked === "true") {
      filter.isBlocked = true
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),

      User.countDocuments(filter)
    ])

    return res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// ROLE UPDATE HELPERS
// ============================
const updateUserRole = async (req, res, role) => {
  try {

    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ success: false })
    }

    user.role = role
    await user.save()

    return res.json({ success: true })

  } catch {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

const promoteToAgent = (req, res) => updateUserRole(req, res, "agent")
const demoteToUser = (req, res) => updateUserRole(req, res, "user")


// ============================
// BLOCK USER
// ============================
const toggleBlockUser = async (req, res) => {
  try {

    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" })
    }

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ success: false })

    user.isBlocked = !user.isBlocked
    await user.save()

    return res.json({ success: true })

  } catch {
    return res.status(500).json({ success: false, message: "Server error" })
  }
}


// ============================
// ACTIVATE USER
// ============================
const activateUser = async (req, res) => {
  try {

    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.isActive = true
    user.isBlocked = false
    await user.save()

    // ✅ NON-BLOCKING EMAIL
    sendEmail({
      email: user.email,
      subject: "Account Activated",
      message: `Hello ${user.name}, your account is now active.`
    }).catch(() => {})

    return res.json({
      success: true,
      message: "User activated"
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// BULK ACTION (OPTIMIZED)
// ============================
const bulkAction = async (req, res) => {
  try {

    const { ids, action } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No users selected" })
    }

    const validIds = ids.filter(id => isValidId(id))

    if (action === "block") {
      await User.updateMany(
        { _id: { $in: validIds } },
        { $set: { isBlocked: true } }
      )
    }

    if (action === "activate") {
      const users = await User.find({ _id: { $in: validIds } })

      await User.updateMany(
        { _id: { $in: validIds } },
        { $set: { isActive: true, isBlocked: false } }
      )

      // ✅ async emails
      users.forEach(user => {
        sendEmail({
          email: user.email,
          subject: "Account Activated",
          message: `Hello ${user.name}, your account is now active.`
        }).catch(() => {})
      })
    }

    return res.json({
      success: true,
      message: "Bulk action completed"
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// EXPORTS
// ============================
module.exports = {
  getAdminStats,
  getAdminChartData,
  getAllUsers,
  promoteToAgent,
  demoteToUser,
  toggleBlockUser,
  activateUser,
  bulkAction
}