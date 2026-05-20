const mongoose = require("mongoose")

let isConnected = false
let isConnecting = false

// ✅ Validate env at load time (fail fast)
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables")
  process.exit(1)
}

// ✅ Global mongoose settings (set once)
mongoose.set("strictQuery", false)

// ✅ Attach event listeners ONCE (avoid memory leaks)
mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected")
})

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected")
  isConnected = false
})

// ✅ Connection function
const connectDB = async (retries = 5, delay = 5000) => {
  if (isConnected) return
  if (isConnecting) return

  isConnecting = true

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // fail fast
        maxPoolSize: 10, // scalable pool
        autoIndex: process.env.NODE_ENV === "development", // disable in production
      })

      isConnected = true
      isConnecting = false

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

      return
    } catch (error) {
      retries--

      console.error(
        `❌ MongoDB connection failed (${retries} retries left):`,
        error.message
      )

      if (retries === 0) {
        console.error("🚨 All retries exhausted. Exiting...")
        process.exit(1)
      }

      // ⏳ Wait before retry
      await new Promise((res) => setTimeout(res, delay))
    }
  }
}

// 🛑 Graceful shutdown (safe, no duplicate execution)
let isShuttingDown = false

const gracefulShutdown = async () => {
  if (isShuttingDown) return
  isShuttingDown = true

  try {
    if (isConnected) {
      await mongoose.connection.close()
      console.log("🛑 MongoDB connection closed")
    }
    process.exit(0)
  } catch (error) {
    console.error("❌ Error during shutdown:", error)
    process.exit(1)
  }
}

// ✅ Handle process signals (production safe)
process.on("SIGINT", gracefulShutdown)
process.on("SIGTERM", gracefulShutdown)
process.on("SIGQUIT", gracefulShutdown)

// Optional: handle crashes
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err)
  gracefulShutdown()
})

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err)
  gracefulShutdown()
})

module.exports = connectDB