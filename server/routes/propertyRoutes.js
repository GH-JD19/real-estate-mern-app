const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")
const upload = require("../middleware/uploadMiddleware")

const {
  createProperty,
  getProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getMyProperties,
  getAgentProperties,
  adminGetAllProperties,
  adminDeleteProperty,
  adminUpdatePropertyStatus,
  toggleFeatured
} = require("../controllers/propertyController")

// ============================
// PUBLIC ROUTES
// ============================

// Featured
router.get("/featured", getFeaturedProperties)

// ⭐ MUST COME BEFORE :id
router.get(
  "/my",
  protect,
  authorize("user", "agent"),
  getMyProperties
)

// ⭐ Agent Listings
router.get(
  "/agent",
  protect,
  authorize("agent"),
  getAgentProperties
)

// All properties
router.get("/", getProperties)

// Single property
router.get("/:id", getSingleProperty)


// ============================
// AGENT / ADMIN CRUD
// ============================

router.post(
  "/",
  protect,
  authorize("AGENT", "ADMIN"),
  (req, res, next) => {
    upload.array("images", 10)(req, res, function (err) {
      if (err) {
        console.log("MULTER ERROR 👉", err)
        return res.status(500).json({ message: err.message })
      }
      next()
    })
  },
  createProperty
)

router.post(
  "/",
  protect,
  authorize("agent", "admin"),
  createProperty
)

router.delete(
  "/:id",
  protect,
  authorize("agent", "admin"),
  deleteProperty
)

//router.get("/", getProperties)
//router.get("/:id", getSingleProperty)


// ============================
// ADMIN DASHBOARD ROUTES
// ============================

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  adminGetAllProperties
)

router.delete(
  "/admin/:id",
  protect,
  authorize("admin"),
  adminDeleteProperty
)

router.put(
  "/admin/status/:id",
  protect,
  authorize("admin"),
  adminUpdatePropertyStatus
)

router.put(
  "/admin/feature/:id",
  protect,
  authorize("admin"),
  toggleFeatured
)

module.exports = router