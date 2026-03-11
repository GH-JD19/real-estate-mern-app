const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  bookVisit,
  getUserVisits,
  getAgentVisits,
  updateVisitStatus,
  getAllVisits
} = require("../controllers/visitController")

// book visit
router.post("/:propertyId", protect, bookVisit)

// user visits
router.get("/user", protect, authorize("user"), getUserVisits)

// agent visits
router.get("/agent", protect, authorize("agent"), getAgentVisits)

// admin visits (NEW)
router.get("/admin", protect, authorize("admin"), getAllVisits)

// update visit
router.patch("/:id", protect, authorize("agent"), updateVisitStatus)

module.exports = router