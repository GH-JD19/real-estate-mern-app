const jwt = require("jsonwebtoken")
const User = require("../models/User")

const protect = async (req, res, next) => {
  try {
    let token = null

    // 1️⃣ Extract token from Authorization header
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization

      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]
      }
    }

    // 2️⃣ Optional: Extract token from cookies (for web apps)
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken
    }

    // 3️⃣ Optional: Allow query token ONLY if explicitly needed (e.g. email links)
    if (!token && req.query?.token) {
      token = req.query.token
    }

    // 4️⃣ No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing"
      })
    }

    // 5️⃣ Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token"
      })
    }

    // 6️⃣ Validate decoded payload
    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload"
      })
    }

    // 7️⃣ Fetch user (lean for performance)
    const user = await User.findById(decoded.id)
      .select("-password")
      .lean()

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      })
    }

    // 8️⃣ Optional: Check if user is blocked/inactive (future-safe)
    if (user.isBlocked || user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive or blocked"
      })
    }

    // 9️⃣ Attach user to request
    req.user = user

    next()
  } catch (error) {
    // 10️⃣ Fallback error (never leak internal errors)
    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    })
  }
}

module.exports = protect