const { body, validationResult } = require("express-validator")
const mongoose = require("mongoose")

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

// ✅ Booking Validation
exports.bookingValidation = [
  body("propertyId")
    .notEmpty()
    .withMessage("Property ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Property ID"),

  body("date")
    .notEmpty()
    .withMessage("Booking date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .toDate()
    .custom((value) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (value < today) {
        throw new Error("Booking date cannot be in the past")
      }
      return true
    }),

  handleValidation,
]

// ✅ Booking Status Validation
exports.bookingStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be approved or rejected")
    .trim()
    .toLowerCase(),

  handleValidation,
]