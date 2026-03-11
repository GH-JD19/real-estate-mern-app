const express = require("express")
const router = express.Router()

const protect = require("../middleware/authMiddleware")
const authorize = require("../middleware/roleMiddleware")

const {
  adminGetAllProperties,
  adminDeleteProperty,
  adminUpdatePropertyStatus
} = require("../controllers/propertyController")

router.use(protect)
router.use(authorize("admin"))

router.get("/properties", adminGetAllProperties)

router.delete("/properties/:id", adminDeleteProperty)

router.put("/properties/status/:id", adminUpdatePropertyStatus)

module.exports = router