const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
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
      index: true
    },

    date: {
      type: Date,
      required: [true, "Booking date is required"],
      validate: {
        validator: function (value) {
          return value && value > new Date()
        },
        message: "Booking date must be in the future"
      }
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
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
 * 🔒 Prevent duplicate bookings:
 * Same user cannot book same property at same date
 */
bookingSchema.index(
  { user: 1, property: 1, date: 1 },
  { unique: true }
)

/**
 * ⚡ Optimize common queries:
 * - Property bookings
 * - Agent dashboards
 */
bookingSchema.index({ property: 1, date: 1 })
bookingSchema.index({ agent: 1, status: 1 })

/**
 * 🛡️ Ensure agent is always tied to property (data consistency)
 */
bookingSchema.pre("save", function (next) {
  if (!this.agent) {
    return next()
  }

  if (!mongoose.Types.ObjectId.isValid(this.agent)) {
    return next(new Error("Invalid agent ID"))
  }

  next()
})

module.exports = mongoose.model("Booking", bookingSchema)