const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    role: {
      type: String,
      enum: ["admin", "agent", "user"],
      required: [true, "Role is required"],
      index: true
    },

    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: [
        "BOOKING",
        "INQUIRY",
        "PROPERTY",
        "SYSTEM"
      ],
      index: true
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"]
    },

    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

/**
 * ⚡ Optimize queries:
 * - User notifications (latest first)
 * - Role-based notifications (admin/agent dashboards)
 */
notificationSchema.index({ user: 1, createdAt: -1 })
notificationSchema.index({ role: 1, read: 1 })
notificationSchema.index({ createdAt: -1 })

/**
 * 🛡️ Basic validation safeguard
 */
notificationSchema.pre("save", function (next) {
  if (!this.user && !this.role) {
    return next(new Error("Notification must have either user or role"))
  }
  next()
})

module.exports = mongoose.model("Notification", notificationSchema)