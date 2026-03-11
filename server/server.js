require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const path = require("path") // ✅ Added

const connectDB = require("./config/db")

// Routes
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

// Error Middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware")

// Connect DB
connectDB()

const app = express()

// ============================
// Global Middleware
// ============================
app.use(express.json())

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(helmet())
app.use(morgan("dev"))

// ✅ Serve Uploaded Images (FINAL FIX)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ============================
// API Routes
// ============================
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

// ============================
// Root Route
// ============================
app.get("/", (req, res) => {
  res.send("Real Estate API is running 🚀")
})

// ============================
// Error Handling
// ============================
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})