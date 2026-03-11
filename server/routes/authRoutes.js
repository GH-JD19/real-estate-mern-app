const express = require("express")
const router = express.Router()

const {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../controllers/authController")

const protect = require("../middleware/authMiddleware")

router.post("/register", registerUser)
router.post("/login", loginUser)

router.get("/me", protect, getMe)

// CHANGE PASSWORD (All authenticated users)
router.put("/change-password", protect, changePassword)

router.post("/forgot-password", forgotPassword)

router.put("/reset-password/:token", resetPassword)

module.exports = router