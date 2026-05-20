const mongoose = require("mongoose")

const visitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property is required"],
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Agent is required"],
      index: true
    },

    visitDate: {
      type: Date,
      required: [true, "Visit date is required"],
      validate: {
        validator: function (value) {
          return value && value > new Date()
        },
        message: "Visit date must be in the future"
      },
      index: true
    },

    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"]
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
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
 * 🔒 Prevent duplicate visit requests:
 * Same user cannot book same property at same date
 */
visitSchema.index(
  { user: 1, property: 1, visitDate: 1 },
  { unique: true }
)

/**
 * ⚡ Optimize common queries:
 * - Agent dashboard
 * - Property visits
 */
visitSchema.index({ agent: 1, status: 1 })
visitSchema.index({ property: 1, visitDate: 1 })

/**
 * 🛡️ Basic sanitization
 */
visitSchema.pre("save", function (next) {
  if (this.message) {
    this.message = this.message.trim()
  }
  next()
})

module.exports = mongoose.model("Visit", visitSchema)