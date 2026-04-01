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

router.post("/register", registerUser)
router.post("/login", loginUser)

router.post("/refresh", refreshToken)
router.post("/logout", logoutUser)
router.post("/logout-all", protect, logoutAllDevices)

router.get("/me", protect, getMe)
router.put("/change-password", protect, changePassword)

router.post("/forgot-password", forgotPassword)
router.put("/reset-password/:token", resetPassword)

module.exports = router