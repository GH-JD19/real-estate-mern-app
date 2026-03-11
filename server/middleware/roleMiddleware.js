const authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied" })
    }

    const userRole = req.user.role.toUpperCase()

    const allowedRoles = roles.map(r => r.toUpperCase())

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" })
    }

    next()
  }
}

module.exports = authorize