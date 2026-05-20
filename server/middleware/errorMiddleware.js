const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode

  if (!statusCode || statusCode === 200) {
    statusCode = 500
  }

  let message = err.message || "Internal Server Error"

  // ============================
  // 🔴 MongoDB Errors
  // ============================

  // Invalid ObjectId
  if (err.name === "CastError") {
    message = "Resource not found"
    statusCode = 404
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0]
    message = field
      ? `${field} already exists`
      : "Duplicate field value entered"
    statusCode = 400
  }

  // Validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    statusCode = 400
  }

  // ============================
  // 🔴 JWT Errors
  // ============================

  if (err.name === "JsonWebTokenError") {
    message = "Invalid token"
    statusCode = 401
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired"
    statusCode = 401
  }

  // ============================
  // 🔴 Invalid JSON
  // ============================

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    message = "Invalid JSON payload"
    statusCode = 400
  }

  // ============================
  // 🔴 Logging
  // ============================

  if (process.env.NODE_ENV !== "production") {
    console.error("💥 ERROR:", err)
  } else {
    console.error("❌ ERROR:", {
      message,
      statusCode,
      path: req.originalUrl,
      method: req.method,
      time: new Date().toISOString(),
    })
  }

  // ============================
  // 🔴 Response
  // ============================

  const response = {
    success: false,
    message,
  }

  // Only show stack in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}

module.exports = { notFound, errorHandler }