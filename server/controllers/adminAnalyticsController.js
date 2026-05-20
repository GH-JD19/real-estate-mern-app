const User = require("../models/User")
const Property = require("../models/Property")
const Visit = require("../models/Visit")

// ============================
// 🔥 SAFE IN-MEMORY CACHE
// ============================
const cache = {}
const CACHE_TTL = 30 * 1000 // 30 sec

// Auto cleanup to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const key in cache) {
    if (now - cache[key].time > CACHE_TTL) {
      delete cache[key]
    }
  }
}, CACHE_TTL)


// ============================
// DASHBOARD STATS (OPTIMIZED)
// ============================
exports.getDashboardStats = async (req, res) => {
  try {

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      totalAgents,
      totalAdmins,
      totalProperties,
      pendingProperties,
      blockedUsers,
      totalBookings,
      propertiesThisMonth,
      propertyTypeStats,
      latestUsers,
      latestProperties
    ] = await Promise.all([

      User.countDocuments({
        role: "user",
        isActive: true,
        isBlocked: false
      }),

      User.countDocuments({
        role: "agent",
        isActive: true,
        isBlocked: false
      }),

      User.countDocuments({ role: "admin" }),

      Property.countDocuments({ status: "APPROVED" }),

      // ✅ FIXED (NO REGEX)
      Property.countDocuments({ status: "PENDING" }),

      User.countDocuments({ isBlocked: true }),

      Visit.countDocuments(),

      Property.countDocuments({
        status: "APPROVED",
        createdAt: { $gte: startOfMonth }
      }),

      Property.aggregate([
        { $match: { status: "APPROVED" } },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 }
          }
        }
      ]),

      // ✅ SAFE LIMIT + NO PASSWORD
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt"),

      Property.find({ status: "APPROVED" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("createdBy", "name email")
    ])

    return res.status(200).json({
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
      propertyTypeStats,
      latestUsers,
      latestProperties
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// MONTHLY CHART DATA (FINAL)
// ============================
exports.getMonthlyCharts = async (req, res) => {
  try {

    // ✅ SAFE QUERY PARSING
    let year = Number(req.query.year)
    let from = Number(req.query.from)
    let to = Number(req.query.to)

    const currentYear = new Date().getFullYear()

    year = Number.isInteger(year) ? year : currentYear
    from = Number.isInteger(from) && from >= 0 && from <= 11 ? from : 0
    to = Number.isInteger(to) && to >= 0 && to <= 11 ? to : 11

    if (from > to) {
      return res.status(400).json({ message: "Invalid month range" })
    }

    const cacheKey = `${year}-${from}-${to}`

    // ✅ CACHE CHECK
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].time < CACHE_TTL)) {
      return res.json(cache[cacheKey].data)
    }

    const startDate = new Date(year, from, 1)
    const endDate = new Date(year, to + 1, 0, 23, 59, 59)

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

      // ✅ FIXED STATUS
      Property.aggregate([
        {
          $match: {
            status: "PENDING",
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
        if (item._id >= 1 && item._id <= 12) {
          months[item._id - 1] = item.count
        }
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
      return Number((((last - first) / first) * 100).toFixed(1))
    }

    const growth = {
      users: calcGrowth("users"),
      agents: calcGrowth("agents"),
      properties: calcGrowth("properties"),
      bookings: calcGrowth("bookings"),
      revenue: calcGrowth("revenue")
    }

    const conversionRate =
      totals.users === 0
        ? 0
        : Number(((totals.bookings / totals.users) * 100).toFixed(1))

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

    return res.json(response)

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
}