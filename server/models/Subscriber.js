const mongoose = require("mongoose")

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        message: "Please enter a valid email address"
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

subscriberSchema.index({ email: 1 }, { unique: true })

subscriberSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim()
  }
  next()
})

module.exports = mongoose.model("Subscriber", subscriberSchema)