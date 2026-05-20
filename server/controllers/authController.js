const jwt = require("jsonwebtoken")
const User = require("../models/User")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")
const Session = require("../models/Session")
const asyncHandler = require("../utils/asyncHandler")

// ================= HELPERS =================

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  isBlocked: user.isBlocked,
})

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)


// ================= REGISTER =================

exports.registerUser = asyncHandler(async (req, res) => {
  const { name, address, email, phone, password, role } = req.body

  if (!name || !email || !phone || !password) {
    res.status(400)
    throw new Error("All required fields must be provided")
  }

  if (!validateEmail(email)) {
    res.status(400)
    throw new Error("Invalid email format")
  }

  if (password.length < 6) {
    res.status(400)
    throw new Error("Password must be at least 6 characters")
  }

  const [emailExists, phoneExists] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ phone }),
  ])

  if (emailExists || phoneExists) {
    res.status(400)
    throw new Error("User already exists")
  }

  const user = await User.create({
    name,
    address,
    email,
    phone,
    password,
    role: role || "user",
    isBlocked: false,
    isActive: false,
  })

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  await Session.create({
    userId: user._id,
    refreshToken,
    device: req.headers["user-agent"],
    ip: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  res.cookie("refreshToken", refreshToken, cookieOptions)

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: sanitizeUser(user),
    accessToken,
  })
})


// ================= LOGIN =================

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error("Email and password are required")
  }

  const user = await User.findOne({ email }).select("+password")

  if (!user || !(await user.matchPassword(password))) {
    res.status(400)
    throw new Error("Invalid email or password")
  }

  if (!user.isActive) {
    res.status(403)
    throw new Error("Account pending approval")
  }

  if (user.isBlocked) {
    res.status(403)
    throw new Error("Account is blocked")
  }

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  await Session.create({
    userId: user._id,
    refreshToken,
    device: req.headers["user-agent"],
    ip: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  res.cookie("refreshToken", refreshToken, cookieOptions)

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: sanitizeUser(user),
    accessToken,
  })
})


// ================= REFRESH TOKEN (ROTATION) =================

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken

  if (!token) {
    res.status(401)
    throw new Error("Unauthorized")
  }

  const session = await Session.findOne({ refreshToken: token })

  if (!session || session.expiresAt < new Date()) {
    res.status(403)
    throw new Error("Session expired")
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
  } catch {
    res.status(403)
    throw new Error("Invalid token")
  }

  // 🔁 ROTATE TOKEN
  const newRefreshToken = generateRefreshToken(decoded.id)

  session.refreshToken = newRefreshToken
  session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await session.save()

  const newAccessToken = generateAccessToken(decoded.id)

  res.cookie("refreshToken", newRefreshToken, cookieOptions)

  res.json({
    success: true,
    accessToken: newAccessToken,
  })
})


// ================= LOGOUT =================

exports.logoutUser = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken

  if (token) {
    await Session.deleteOne({ refreshToken: token })
  }

  res.clearCookie("refreshToken", cookieOptions)

  res.json({
    success: true,
    message: "Logged out successfully",
  })
})


// ================= LOGOUT ALL =================

exports.logoutAllDevices = asyncHandler(async (req, res) => {
  await Session.deleteMany({ userId: req.user._id })

  res.clearCookie("refreshToken", cookieOptions)

  res.json({
    success: true,
    message: "Logged out from all devices",
  })
})


// ================= FORGOT PASSWORD =================

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  // ✅ Prevent email enumeration
  if (!user) {
    return res.json({
      success: true,
      message: "If email exists, reset link sent",
    })
  }

  const resetToken = crypto.randomBytes(20).toString("hex")

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  await user.save({ validateBeforeSave: false })

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

  const message = `Reset your password:\n${resetUrl}\nValid for 10 minutes.`

  sendEmail({
    email: user.email,
    subject: "Password Reset",
    message,
  }).catch(() => {})

  res.json({
    success: true,
    message: "If email exists, reset link sent",
  })
})


// ================= RESET PASSWORD =================

exports.resetPassword = asyncHandler(async (req, res) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    res.status(400)
    throw new Error("Invalid or expired token")
  }

  if (!req.body.password || req.body.password.length < 6) {
    res.status(400)
    throw new Error("Password must be at least 6 characters")
  }

  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  // 🔥 invalidate all sessions after password reset
  await Session.deleteMany({ userId: user._id })

  res.json({
    success: true,
    message: "Password reset successful",
  })
})


// ================= GET ME =================

exports.getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401)
    throw new Error("Unauthorized")
  }

  res.json({
    success: true,
    user: sanitizeUser(req.user),
  })
})


// ================= CHANGE PASSWORD =================

exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword || newPassword.length < 6) {
    res.status(400)
    throw new Error("Invalid password")
  }

  const user = await User.findById(req.user._id).select("+password")

  if (!user || !(await user.matchPassword(oldPassword))) {
    res.status(400)
    throw new Error("Old password incorrect")
  }

  user.password = newPassword
  await user.save()

  // 🔥 invalidate all sessions
  await Session.deleteMany({ userId: user._id })

  res.json({
    success: true,
    message: "Password updated successfully",
  })
})