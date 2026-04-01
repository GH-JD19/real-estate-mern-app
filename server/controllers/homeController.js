const Property = require("../models/Property")

const getHomeData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 6
    const skip = (page - 1) * limit

    // Featured properties
    const featured = await Property.find({ featured: true }).limit(3)

    // Paginated properties
    const properties = await Property.find()
      .skip(skip)
      .limit(limit)

    const total = await Property.countDocuments()

    res.status(200).json({
      featured,
      properties,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

module.exports = { getHomeData }