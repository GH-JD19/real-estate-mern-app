const User = require("../models/User")
const Property = require("../models/Property")
const Visit = require("../models/Visit")

// 🔥 Simple in-memory cache (optional but useful)
const cache = {}
const CACHE_TTL = 30 * 1000 // 30 sec

// ============================
// DASHBOARD STATS
// ============================
exports.getDashboardStats = async (req, res) => {
  try {

    const totalUsers = await User.countDocuments({
      role: "user",
      isActive: true,
      isBlocked: false
    })

    const totalAgents = await User.countDocuments({
      role: "agent",
      isActive: true,
      isBlocked: false
    })

    const totalAdmins = await User.countDocuments({
      role: "admin"
    })

    const totalProperties = await Property.countDocuments({
      status: "APPROVED"
    })

    const pendingProperties = await Property.countDocuments({
      status: { $regex: /^pending$/i }
    })

    const blockedUsers = await User.countDocuments({
      isBlocked: true
    })

    const totalBookings = await Visit.countDocuments()

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0,0,0,0)

    const propertiesThisMonth = await Property.countDocuments({
      status: "APPROVED",
      createdAt: { $gte: startOfMonth }
    })

    const propertyTypeStats = await Property.aggregate([
      { $match: { status: "APPROVED" } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ])

    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password")

    const latestProperties = await Property.find({
      status: "APPROVED"
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "name email")

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAgents,
        totalAdmins,
        totalProperties,
        pendingProperties,
        propertiesThisMonth,
        blockedUsers,
        totalBookings
      },
      latestUsers,
      latestProperties
    })

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}


// ============================
// MONTHLY CHART DATA (FIXED)
// ============================
exports.getMonthlyCharts = async (req, res) => {
  try {

    const year = parseInt(req.query.year) || new Date().getFullYear()
    const from = parseInt(req.query.from) || 0
    const to = parseInt(req.query.to) || 11

    const cacheKey = `${year}-${from}-${to}`

    // ✅ CACHE CHECK
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].time < CACHE_TTL)) {
      return res.json(cache[cacheKey].data)
    }

    const startDate = new Date(year, from, 1)
    const endDate = new Date(year, to + 1, 0, 23, 59, 59)

    // =====================
    // AGGREGATIONS (PARALLEL 🚀)
    // =====================

    const [
      users,
      agents,
      properties,
      pending,
      blocked,
      bookings
    ] = await Promise.all([

      User.aggregate([
        {
          $match: {
            role: "user",
            isActive: true,
            isBlocked: false,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
      ]),

      User.aggregate([
        {
          $match: {
            role: "agent",
            isActive: true,
            isBlocked: false,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
      ]),

      Property.aggregate([
        {
          $match: {
            status: "APPROVED",
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
      ]),

      Property.aggregate([
        {
          $match: {
            status: { $regex: /^pending$/i },
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
      ]),

      User.aggregate([
        {
          $match: {
            isBlocked: true,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
      ]),

      // ✅ FIXED BOOKINGS (WITH DATE FILTER)
      Visit.aggregate([
        {
          $match: {
            visitDate: { $exists: true },
            $expr: {
              $and: [
                { $gte: [{ $toDate: "$visitDate" }, startDate] },
                { $lte: [{ $toDate: "$visitDate" }, endDate] }
              ]
            }
          }
        },
        {
          $group: {
            _id: { $month: { $toDate: "$visitDate" } },
            count: { $sum: 1 }
          }
        }
      ])

    ])

    // =====================
    // FORMAT DATA
    // =====================

    const buildMonthlyData = (data) => {
      const months = Array(12).fill(0)
      data.forEach(item => {
        months[item._id - 1] = item.count
      })
      return months
    }

    const usersData = buildMonthlyData(users)
    const agentsData = buildMonthlyData(agents)
    const propertiesData = buildMonthlyData(properties)
    const pendingData = buildMonthlyData(pending)
    const blockedData = buildMonthlyData(blocked)
    const bookingsData = buildMonthlyData(bookings)

    const chartData = Array.from({ length: 12 }, (_, i) => ({
      users: usersData[i],
      agents: agentsData[i],
      properties: propertiesData[i],
      pending: pendingData[i],
      blocked: blockedData[i],
      bookings: bookingsData[i],
      revenue: bookingsData[i] * 1000
    })).slice(from, to + 1)

    // =====================
    // TOTALS
    // =====================

    const totals = chartData.reduce((acc, cur) => {
      acc.users += cur.users
      acc.agents += cur.agents
      acc.properties += cur.properties
      acc.bookings += cur.bookings
      acc.revenue += cur.revenue
      return acc
    }, {
      users: 0,
      agents: 0,
      properties: 0,
      bookings: 0,
      revenue: 0
    })

    // =====================
    // GROWTH
    // =====================

    const calcGrowth = (key) => {
      if (chartData.length < 2) return 0
      const first = chartData[0][key]
      const last = chartData[chartData.length - 1][key]
      if (first === 0) return last === 0 ? 0 : 100
      return (((last - first) / first) * 100).toFixed(1)
    }

    const growth = {
      users: calcGrowth("users"),
      agents: calcGrowth("agents"),
      properties: calcGrowth("properties"),
      bookings: calcGrowth("bookings"),
      revenue: calcGrowth("revenue")
    }

    // =====================
    // CONVERSION
    // =====================

    const conversionRate =
      totals.users === 0
        ? 0
        : ((totals.bookings / totals.users) * 100).toFixed(1)

    // =====================
    // INSIGHTS
    // =====================

    const insights = [
      `Users growth is ${growth.users}%`,
      `Agents growth is ${growth.agents}%`,
      `Properties growth is ${growth.properties}%`,
      `Bookings growth is ${growth.bookings}%`,
      `Revenue growth is ${growth.revenue}%`,
      `Conversion rate is ${conversionRate}%`
    ]

    const response = {
      chartData,
      totals,
      growth,
      conversionRate,
      insights
    }

    // ✅ SAVE CACHE
    cache[cacheKey] = {
      time: Date.now(),
      data: response
    }

    res.json(response)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
}