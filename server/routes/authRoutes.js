const express = require("express")
const router = express.Router()

const {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  logoutUser,
  logoutAllDevices
} = require("../controllers/authController")

const protect = require("../middleware/authMiddleware")

const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} = require("../validators/auth.validator")

const rateLimit = require("express-rate-limit")

// ✅ Rate limiters (critical for auth security)

// General auth limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Too many requests, please try again later"
})

// Strict limiter for sensitive routes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts, please try again later"
})

// Medium limiter (login/register)
const mediumLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests, please try again later"
})

// ✅ Validate reset token param
const validateResetToken = (req, res, next) => {
  const { token } = req.params

  if (!token || token.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing reset token"
    })
  }

  next()
}

// ==========================
// PUBLIC ROUTES
// ==========================

router.post("/register", mediumLimiter, registerValidation, registerUser)

router.post("/login", mediumLimiter, loginValidation, loginUser)

router.post("/refresh", strictLimiter, refreshToken)

router.post("/forgot-password", strictLimiter, forgotPassword)

router.put(
  "/reset-password/:token",
  strictLimiter,
  validateResetToken,
  resetPassword
)

router.post("/logout", authLimiter, logoutUser)


// ==========================
// PROTECTED ROUTES
// ==========================

router.get("/me", protect, getMe)

router.put(
  "/change-password",
  protect,
  strictLimiter,
  changePasswordValidation,
  changePassword
)

router.post("/logout-all", protect, strictLimiter, logoutAllDevices)

module.exports = router