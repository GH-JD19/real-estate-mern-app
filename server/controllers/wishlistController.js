const User = require("../models/User")

exports.addToWishlist = async (req, res) => {

  try {

    const user = await User.findById(req.user._id)

    if (!user.wishlist.includes(req.params.id)) {
      user.wishlist.push(req.params.id)
      await user.save()
    }

    res.json({
      success: true,
      message: "Added to wishlist"
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }

}

exports.removeFromWishlist = async (req, res) => {

  try {

    const user = await User.findById(req.user._id)

    user.wishlist = user.wishlist.filter(
      id => id.toString() !== req.params.id
    )

    await user.save()

    res.json({
      success: true,
      message: "Removed from wishlist"
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }

}

exports.getWishlist = async (req, res) => {

  try {

    const user = await User.findById(req.user._id)
      .populate("wishlist")

    res.json({
      success: true,
      properties: user.wishlist
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }

}