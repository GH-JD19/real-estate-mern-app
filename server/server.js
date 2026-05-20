require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const path = require("path")
const rateLimit = require("express-rate-limit")
const compression = require("compression")
const http = require("http")

const connectDB = require("./config/db")
const { initSocket } = require("./socket")

// Routes
const homeRoutes = require("./routes/homeRoutes")
const authRoutes = require("./routes/authRoutes")
const propertyRoutes = require("./routes/propertyRoutes")
const adminRoutes = require("./routes/adminRoutes")
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes")
const wishlistRoutes = require("./routes/wishlistRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const inquiryRoutes = require("./routes/inquiryRoutes")
const userRoutes = require("./routes/userRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const visitRoutes = require("./routes/visitRoutes")
const subscriberRoutes = require("./routes/subscriberRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const messageRoutes = require("./routes/messageRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware")

// ============================
// ✅ STRONG ENV VALIDATION
// ============================
const requiredEnv = ["CLIENT_URL", "MONGO_URI", "JWT_SECRET"]

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing ENV: ${key}`)
    process.exit(1)
  }
})

// ============================
// INIT APP
// ============================
const app = express()
app.disable("x-powered-by")
app.set("trust proxy", 1)

// ============================
// SECURITY
// ============================
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_2,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)

      console.warn("⚠️ Blocked by CORS:", origin)
      return callback(null, false) // safer than throwing error
    },
    credentials: true,
  })
)

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
)

app.use(compression())

// ============================
// BODY PARSER
// ============================
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))

// ============================
// LOGGING
// ============================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// ============================
// RATE LIMIT
// ============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // increased
  standardHeaders: true,
  legacyHeaders: false,
})

app.use("/api", limiter)

// ============================
// STATIC FILES (SAFE)
// ============================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d",
  })
)

// ============================
// HEALTH CHECK
// ============================
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy ✅",
    uptime: process.uptime(),
    timestamp: new Date(),
  })
})

// ============================
// ROUTES
// ============================
app.use("/api", homeRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/properties", propertyRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/admin-analytics", adminAnalyticsRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/inquiries", inquiryRoutes)
app.use("/api/users", userRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/visits", visitRoutes)
app.use("/api/subscribe", subscriberRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Real Estate API is running")
})

// ============================
// ERROR HANDLING
// ============================
app.use(notFound)
app.use(errorHandler)

// ============================
// START SERVER (SAFE DB START)
// ============================
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    const server = http.createServer(app)
    initSocket(server)

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })

    // Graceful shutdown
    process.on("SIGINT", () => process.exit(0))
    process.on("SIGTERM", () => process.exit(0))

  } catch (err) {
    console.error("❌ Failed to start server:", err)
    process.exit(1)
  }
}

startServer()

// ============================
// GLOBAL ERROR HANDLING
// ============================
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err)
  process.exit(1)
})

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err)
  process.exit(1)
})