const Review = require("../models/Review")
const Property = require("../models/Property")

// ============================
// ADD REVIEW
// ============================
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const propertyId = req.params.propertyId

    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      })
    }

    // Prevent duplicate review
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
      rating,
      comment,
      user: req.user._id,
      property: propertyId
    })

    // Recalculate ratings
    const reviews = await Review.find({ property: propertyId })

    const avg =
      reviews.reduce((acc, item) => acc + item.rating, 0) /
      reviews.length

    property.averageRating = avg
    property.totalReviews = reviews.length

    await property.save()

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ============================
// GET PROPERTY REVIEWS
// ============================
exports.getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      property: req.params.propertyId
    }).populate("user", "name email")

    res.status(200).json({
      success: true,
      total: reviews.length,
      reviews
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}