const nodemailer = require("nodemailer")

// ✅ Validate environment variables (fail fast)
const requiredEnv = ["EMAIL_USER", "EMAIL_PASS"]

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`)
    process.exit(1)
  }
})

// ✅ Create transporter ONCE (performance optimized)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ✅ Verify transporter (only in development)
if (process.env.NODE_ENV === "development") {
  transporter.verify((err) => {
    if (err) {
      console.error("❌ Email transporter error:", err)
    } else {
      console.log("📧 Email server is ready")
    }
  })
}

// ✅ Send email function
const sendEmail = async ({ email, subject, message, html }) => {
  // Basic validation
  if (!email || !subject || (!message && !html)) {
    throw new Error("Missing required email fields")
  }

  try {
    const info = await transporter.sendMail({
      from: `"Real Estate Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: message || undefined,
      html: html || undefined,
    })

    // Dev logging only
    if (process.env.NODE_ENV === "development") {
      console.log("📨 Email sent:", info.messageId)
    }

    return info
  } catch (error) {
    console.error("❌ Email send failed:", error.message)

    // Do NOT expose internal error details to controllers
    throw new Error("Email could not be sent")
  }
}

module.exports = sendEmail