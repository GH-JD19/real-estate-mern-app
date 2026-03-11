const User = require("../models/User")
const Property = require("../models/Property")
const Booking = require("../models/Booking")

// ============================
// GET ADMIN DASHBOARD STATS
// ============================
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" })
    const totalAgents = await User.countDocuments({ role: "agent" })
    const blockedUsers = await User.countDocuments({ isBlocked: true })

    const totalProperties = await Property.countDocuments()
    const pendingProperties = await Property.countDocuments({
      status: { $regex: /^pending$/i }
    })

    const totalBookings = await Booking.countDocuments()

    res.status(200).json({
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
    res.status(500).json({ success:false, message:error.message })
  }
}


// ============================
// GET ADMIN CHART DATA
// ============================
const getAdminChartData = async (req, res) => {
  try {

    const userGrowth = await User.aggregate([
      { $match: { role: "user" } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
    ])

    const agentGrowth = await User.aggregate([
      { $match: { role: "agent" } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
    ])

    const propertyGrowth = await Property.aggregate([
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
    ])

    const pendingGrowth = await Property.aggregate([
      { $match: { status: { $regex: /^pending$/i } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
    ])

    const blockedGrowth = await User.aggregate([
      { $match: { isBlocked: true } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
    ])

    const bookingGrowth = await Booking.aggregate([
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: 1 } } }
    ])

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    const chartData = months.map((month, index) => {

      const user = userGrowth.find(u => u._id === index + 1)
      const agent = agentGrowth.find(a => a._id === index + 1)
      const property = propertyGrowth.find(p => p._id === index + 1)
      const pending = pendingGrowth.find(p => p._id === index + 1)
      const blocked = blockedGrowth.find(b => b._id === index + 1)
      const booking = bookingGrowth.find(b => b._id === index + 1)

      return {
        name: month,
        users: user ? user.total : 0,
        agents: agent ? agent.total : 0,
        properties: property ? property.total : 0,
        pending: pending ? pending.total : 0,
        bookings: booking ? booking.total : 0
      }
    })

    res.status(200).json({
      success: true,
      chartData
    })

  } catch (error) {
    res.status(500).json({ success:false, message:error.message })
  }
}


// ============================
// GET ALL USERS (WITH FILTER)
// ============================
const getAllUsers = async (req, res) => {
  try {

    let filter = {}

    // Filter agents
    if (req.query.role === "agent") {
      filter.role = "agent"
    }

    // Filter normal users
    if (req.query.role === "user") {
      filter.role = "user"
    }

    // Filter blocked users
    if (req.query.blocked === "true") {
      filter.isBlocked = true
    }

    const users = await User.find(filter).select("-password")

    res.json({ success:true, users })

  } catch (error) {
    res.status(500).json({ success:false, message:error.message })
  }
}


// ============================
// PROMOTE USER
// ============================
const promoteToAgent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success:false })

    user.role = "agent"
    await user.save()

    res.json({ success:true })
  } catch (error) {
    res.status(500).json({ success:false, message:error.message })
  }
}


// ============================
// DEMOTE USER
// ============================
const demoteToUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success:false })

    user.role = "user"
    await user.save()

    res.json({ success:true })
  } catch (error) {
    res.status(500).json({ success:false, message:error.message })
  }
}


// ============================
// BLOCK USER
// ============================
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success:false })

    user.isBlocked = !user.isBlocked
    await user.save()

    res.json({ success:true })
  } catch (error) {
    res.status(500).json({ success:false, message:error.message })
  }
}


// ============================
// EXPORTS (VERY IMPORTANT)
// ============================
module.exports = {
  getAdminStats,
  getAdminChartData,
  getAllUsers,
  promoteToAgent,
  demoteToUser,
  toggleBlockUser
}