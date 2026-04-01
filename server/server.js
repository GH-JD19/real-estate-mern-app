require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const path = require("path")
const rateLimit = require("express-rate-limit")

const http = require("http")
const { Server } = require("socket.io")

const connectDB = require("./config/db")

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

const { notFound, errorHandler } = require("./middleware/errorMiddleware")

connectDB()

const app = express()

// ============================
// Middleware
// ============================
app.use(express.json())

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}))

app.use(helmet())
app.use(morgan("dev"))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
})

app.use(limiter)

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ============================
// Routes
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
app.use("/api/v1/subscribe", subscriberRoutes)
app.use("/api/notifications", notificationRoutes)

app.get("/", (req, res) => {
  res.send("Real Estate API is running 🚀")
})

// ============================
// SOCKET.IO SETUP
// ============================
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
})

global.io = io

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id)

  // ✅ ADMIN
  socket.on("joinAdmin", () => {
    socket.join("admin-room")
    console.log("👑 Admin joined")
  })

  // ✅ AGENT
  socket.on("joinAgent", () => {
    socket.join("agent-room")
    console.log("🏢 Agent joined")
  })

  // ✅ USER (IMPORTANT)
  socket.on("joinUser", (userId) => {
    socket.join(`user-${userId}`)
    console.log("👤 User joined:", userId)
  })

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id)
  })
})

// ============================
// Error
// ============================
app.use(notFound)
app.use(errorHandler)

// ============================
// Start Server
// ============================
const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})