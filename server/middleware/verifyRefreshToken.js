const jwt = require("jsonwebtoken")

const verifyRefreshToken = (req, res, next) => {
  try {
    let token = null

    // 1️⃣ Extract token from body
    if (req.body?.refreshToken) {
      token = req.body.refreshToken
    }

    // 2️⃣ Optional: Extract from cookies (recommended for web)
    if (!token && req.cookies?.refreshToken) {
      token = req.cookies.refreshToken
    }

    // 3️⃣ Token missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      })
    }

    // 4️⃣ Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    } catch (err) {
      return res.status(403).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Refresh token expired"
            : "Invalid refresh token",
      })
    }

    // 5️⃣ Validate payload
    if (!decoded?.id) {
      return res.status(403).json({
        success: false,
        message: "Invalid token payload",
      })
    }

    // 6️⃣ Attach to request
    req.user = decoded

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Token verification failed",
    })
  }
}

module.exports = verifyRefreshToken