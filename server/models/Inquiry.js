const mongoose = require("mongoose")

const inquirySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [1000, "Message cannot exceed 1000 characters"]
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[6-9]\d{9}$/.test(v) // Indian mobile numbers only
        },
        message: "Enter a valid 10-digit Indian phone number"
      },
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true
    },

    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
      index: true
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agent is required"],
      index: true
    },

    status: {
      type: String,
      enum: ["PENDING", "CONTACTED", "CLOSED"],
      default: "PENDING",
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

/**
 * 🔒 Prevent spam duplicate inquiries:
 * Same user cannot send same message for same property within short time
 */
inquirySchema.index(
  { user: 1, property: 1, message: 1 },
  { unique: true }
)

/**
 * ⚡ Optimize frequent queries:
 * - Agent dashboard (inquiries)
 * - Property inquiries
 */
inquirySchema.index({ agent: 1, status: 1 })
inquirySchema.index({ property: 1, createdAt: -1 })

/**
 * 🛡️ Normalize phone before saving
 */
inquirySchema.pre("save", function (next) {
  if (this.phone) {
    this.phone = this.phone.replace(/\D/g, "") // remove non-digits
  }
  next()
})

module.exports = mongoose.model("Inquiry", inquirySchema)