const mongoose = require("mongoose")
const User = require("../models/User")

// ============================
// HELPERS
// ============================
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)


// ============================
// ADD TO WISHLIST
// ============================
exports.addToWishlist = async (req, res) => {
  try {

    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: id } }, // ✅ prevents duplicates
      { new: true }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    return res.json({
      success: true,
      message: "Added to wishlist"
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// REMOVE FROM WISHLIST
// ============================
exports.removeFromWishlist = async (req, res) => {
  try {

    const { id } = req.params

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID"
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: id } },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    return res.json({
      success: true,
      message: "Removed from wishlist"
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// ============================
// GET WISHLIST (WITH PAGINATION)
// ============================
exports.getWishlist = async (req, res) => {
  try {

    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 10

    page = page < 1 ? 1 : page
    limit = limit > 50 ? 50 : limit

    const skip = (page - 1) * limit

    const user = await User.findById(req.user._id)
      .populate({
        path: "wishlist",
        options: {
          sort: { createdAt: -1 },
          skip,
          limit
        },
        select: "title price city images"
      })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const total = user.wishlist.length

    return res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      properties: user.wishlist
    })

  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}