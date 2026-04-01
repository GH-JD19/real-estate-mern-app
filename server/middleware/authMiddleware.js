const jwt = require("jsonwebtoken")
const User = require("../models/User")

const protect = async (req, res, next) => {
  let token

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token && req.query.token) {
      token = req.query.token
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token"
      })
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

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
      message: "Token expired"
    })
  }
}

module.exports = protect