const { body, validationResult } = require("express-validator")

// ✅ Common error handler (DRY + consistent response)
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

// ✅ Strong password rule (MATCHES FRONTEND EXACTLY)
const strongPasswordRule = (field = "password") =>
  body(field)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[a-z]/)
    .withMessage("Password must include a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must include an uppercase letter")
    .matches(/\d/)
    .withMessage("Password must include a number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must include a special character")

// ✅ Register validation
exports.registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  strongPasswordRule("password"),

  handleValidation,
]

// ✅ Login validation
exports.loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email required")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password required"),

  handleValidation,
]

// ✅ Change Password Validation (FIXED)
exports.changePasswordValidation = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required"),

  strongPasswordRule("newPassword"),

  handleValidation,
]