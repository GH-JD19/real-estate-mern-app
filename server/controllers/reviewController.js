const mongoose = require("mongoose")
const Review = require("../models/Review")
const Property = require("../models/Property")

// ============================
// HELPERS
// ============================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)


// ============================
// ADD REVIEW
// ============================
exports.addReview = async (req, res) => {
  try {

    const { rating, comment } = req.body
    const { propertyId } = req.params

    // ✅ VALIDATION
    if (!isValidId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      })
    }

    const numericRating = Number(rating)

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      })
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Comment is too short"
      })
    }

    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    // ✅ PREVENT DUPLICATE
    const existingReview = await Review.findOne({
      property: propertyId,
      user: req.user._id
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this property"
      })
    }

    const review = await Review.create({
      rating: numericRating,
      comment: comment.trim(),
      user: req.user._id,
      property: propertyId
    })

    // ✅ AGGREGATION (FAST)
    const stats = await Review.aggregate([
      { $match: { property: new mongoose.Types.ObjectId(propertyId) } },
      {
        $group: {
          _id: "$property",
          avgRating: { $avg: "$rating" },
          total: { $sum: 1 }
        }
      }
    ])

    property.averageRating = stats[0]?.avgRating || numericRating
    property.totalReviews = stats[0]?.total || 1

    await property.save()

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// GET PROPERTY REVIEWS
// ============================
exports.getPropertyReviews = async (req, res) => {
  try {

    const { propertyId } = req.params

    if (!isValidId(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      })
    }

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 10

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([

      Review.find({ property: propertyId })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Review.countDocuments({ property: propertyId })
    ])

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      reviews
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}