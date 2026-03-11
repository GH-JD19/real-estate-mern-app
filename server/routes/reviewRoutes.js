const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")

const {
  addReview,
  getPropertyReviews
} = require("../controllers/reviewController")

router.post("/:propertyId", protect, addReview)
router.get("/:propertyId", getPropertyReviews)

module.exports = router