const Property = require("../models/Property")

// ============================
// HOME DATA (PRODUCTION READY)
// ============================
const getHomeData = async (req, res) => {
  try {

    // ✅ SAFE PAGINATION
    let page = Number(req.query.page) || 1
    const limit = 6

    page = page < 1 ? 1 : page
    const skip = (page - 1) * limit

    // ============================
    // PARALLEL DB CALLS 🚀
    // ============================
    const [featured, properties, total] = await Promise.all([

      // ✅ FEATURED (ONLY APPROVED)
      Property.find({
        featured: true,
        status: "APPROVED"
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("title city price images"),

      // ✅ PAGINATED LIST
      Property.find({
        status: "APPROVED"
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("title city price images"),

      // ✅ TOTAL COUNT
      Property.countDocuments({
        status: "APPROVED"
      })
    ])

    return res.status(200).json({
      success: true,
      featured,
      properties,
      totalPages: Math.ceil(total / limit)
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}

module.exports = { getHomeData }