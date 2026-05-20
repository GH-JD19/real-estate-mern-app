const mongoose = require("mongoose")

const wishlistSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

/**
 * 🔒 Prevent duplicate wishlist entries
 * One user → one property only once
 */
wishlistSchema.index(
  { user: 1, property: 1 },
  { unique: true }
)

/**
 * ⚡ Optimize queries:
 * - User wishlist
 * - Property popularity checks
 */
wishlistSchema.index({ user: 1, createdAt: -1 })
wishlistSchema.index({ property: 1 })

module.exports = mongoose.model("Wishlist", wishlistSchema)