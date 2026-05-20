const mongoose = require("mongoose")
const crypto = require("crypto")

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true
    },

    refreshToken: {
      type: String,
      required: [true, "Refresh token is required"],
      select: false // 🔒 never return in queries
    },

    device: {
      type: String,
      trim: true,
      maxlength: [200, "Device info too long"]
    },

    ip: {
      type: String,
      trim: true
    },

    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

/**
 * 🔒 Hash refresh token before saving
 */
sessionSchema.pre("save", async function () {
  if (!this.isModified("refreshToken")) return

  const crypto = require("crypto")

  this.refreshToken = crypto
    .createHash("sha256")
    .update(this.refreshToken)
    .digest("hex")
})

/**
 * 🔐 Method to compare token
 */
sessionSchema.methods.compareToken = function (token) {
  const hashed = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

  return this.refreshToken === hashed
}

/**
 * ⚡ Indexes for performance
 */
sessionSchema.index({ user: 1, createdAt: -1 })

/**
 * 🧹 TTL auto delete expired sessions
 */
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model("Session", sessionSchema)