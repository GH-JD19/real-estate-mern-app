const jwt = require("jsonwebtoken")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )
}


// REGISTER
exports.registerUser = async (req, res) => {
  try {

    const { name, address, email, phone, password, role } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
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

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      token
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


// LOGIN
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

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


// FORGOT PASSWORD
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

    // generate reset token
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


// RESET PASSWORD
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


// GET CURRENT USER
exports.getMe = async (req, res) => {
  try {

    // req.user already comes from protect middleware
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