const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer"
      },
    },

    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [5, "Comment must be at least 5 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"]
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
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

/**
 * 🔒 Prevent duplicate reviews:
 * One user can review a property only once
 */
reviewSchema.index(
  { user: 1, property: 1 },
  { unique: true }
)

/**
 * ⚡ Optimize queries:
 * - Property reviews (most common)
 * - Recent reviews
 */
reviewSchema.index({ property: 1, createdAt: -1 })
reviewSchema.index({ rating: 1 })

/**
 * 🛡️ Basic sanitization
 */
reviewSchema.pre("save", function (next) {
  if (this.comment) {
    this.comment = this.comment.trim()
  }
  next()
})

module.exports = mongoose.model("Review", reviewSchema)