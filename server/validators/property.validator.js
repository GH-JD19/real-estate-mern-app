const { body, validationResult } = require("express-validator")

// ✅ Common error handler (DRY + consistent)
const handleValidation = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    })
  }

  next()
}

// ✅ Allowed property types (adjust only if your DB supports more)
const allowedTypes = ["buy", "sell", "rent"]

// ✅ Property Validation
exports.propertyValidation = [
  // 🏷 Title
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),

  // 💰 Price
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number")
    .toFloat(),

  // 📍 Latitude
  body("lat")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90")
    .toFloat(),

  // 📍 Longitude
  body("lng")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180")
    .toFloat(),

  // 🏠 Property Type
  body("type")
    .notEmpty()
    .withMessage("Property type is required")
    .isIn(allowedTypes)
    .withMessage(`Type must be one of: ${allowedTypes.join(", ")}`)
    .trim()
    .toLowerCase(),

  handleValidation,
]