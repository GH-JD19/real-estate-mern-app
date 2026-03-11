const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require("../controllers/wishlistController")

// Add property to wishlist
router.put("/add/:id", protect, addToWishlist)

// Remove property from wishlist
router.put("/remove/:id", protect, removeFromWishlist)

// Get user's wishlist
router.get("/", protect, getWishlist)

module.exports = router