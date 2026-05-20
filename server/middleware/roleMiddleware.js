const authorize = (...roles) => {
  // 1️⃣ Normalize roles once (performance optimization)
  const allowedRoles = roles
    .filter(Boolean)
    .map((role) => String(role).toUpperCase())

  // 2️⃣ Fail fast if no roles provided (developer mistake)
  if (allowedRoles.length === 0) {
    throw new Error("authorize middleware requires at least one role")
  }

  return (req, res, next) => {
    try {
      // 3️⃣ Ensure auth middleware ran before this
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user missing",
        })
      }

      // 4️⃣ Validate user role
      const userRole = req.user.role
        ? String(req.user.role).toUpperCase()
        : null

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "Access denied, role missing",
        })
      }

      // 5️⃣ Check permission
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden, insufficient permissions",
        })
      }

      next()
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      })
    }
  }
}

module.exports = authorize