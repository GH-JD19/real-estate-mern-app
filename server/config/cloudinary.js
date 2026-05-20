const cloudinary = require("cloudinary").v2

// ✅ Validate required environment variables (fail fast)
const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
]

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`)
    process.exit(1) // stop app immediately (production safety)
  }
})

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // always use HTTPS (important for production)
})

// ✅ Optional: basic sanity check (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("✅ Cloudinary configured successfully")
}

module.exports = cloudinary