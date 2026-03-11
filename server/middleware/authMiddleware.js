const jwt = require("jsonwebtoken")
const User = require("../models/User")

const protect = async (req, res, next) => {
  let token

  try {

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Backup support (optional)
    if (!token && req.query.token) {
      token = req.query.token
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token"
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach FULL user to request
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      })
    }

    req.user = user

    next()

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed"
    })
  }
}

module.exports = protect