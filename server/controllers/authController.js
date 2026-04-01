const jwt = require("jsonwebtoken")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")
const Session = require("../models/Session")

// ================= TOKEN GENERATORS =================

const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  )
}

const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  )
}

// ================= REGISTER =================

exports.registerUser = async (req, res) => {
  try {
    const { name, address, email, phone, password, role } = req.body

    const emailExists = await User.findOne({ email })
    if (emailExists) {
      return res.status(400).json({
        success: false,
        field: "email",
        message: "Email already registered",
      })
    }

    const phoneExists = await User.findOne({ phone })
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        field: "phone",
        message: "Mobile number already registered",
      })
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      accessToken,
      refreshToken
    })

  } catch (error) {

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]

      let message = ""

      if (field === "email") message = "Email already registered"
      else if (field === "phone") message = "Mobile number already registered"
      else message = `${field} already exists`

      return res.status(400).json({
        success: false,
        field,
        message,
      })
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    })
  }
}

// ================= LOGIN =================

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval"
      })
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      })
    }

    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    await Session.create({
      userId: user._id,
      refreshToken,
      device: req.headers["user-agent"],
      ip: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      accessToken,
      refreshToken
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================= REFRESH TOKEN =================

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No token" })
    }

    const session = await Session.findOne({ refreshToken })

    if (!session) {
      return res.status(403).json({ success: false, message: "Invalid session" })
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    const newAccessToken = generateAccessToken(decoded.id)

    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    })

  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Refresh token expired"
    })
  }
}

// ================= LOGOUT =================

exports.logoutUser = async (req, res) => {
  const { refreshToken } = req.body

  await Session.deleteOne({ refreshToken })

  res.json({
    success: true,
    message: "Logged out successfully"
  })
}

// ================= LOGOUT ALL =================

exports.logoutAllDevices = async (req, res) => {
  await Session.deleteMany({ userId: req.user._id })

  res.json({
    success: true,
    message: "Logged out from all devices"
  })
}

// ================= FORGOT PASSWORD =================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email"
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

    const message = `
Password Reset Request

Click the link below to reset your password:

${resetUrl}

This link will expire in 10 minutes.
`

    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      message
    })

    res.status(200).json({
      success: true,
      message: "Reset link sent to email"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ================= RESET PASSWORD =================

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex")

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or expired"
      })
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// ================= GET ME =================

exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      })
    }

    res.status(200).json({
      success: true,
      user: req.user
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================= CHANGE PASSWORD =================

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id).select("+password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const isMatch = await user.matchPassword(currentPassword)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      })
    }

    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}