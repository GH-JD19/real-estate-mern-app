const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ["admin", "agent", "user"],
    required: true
  },
  type: String,
  message: String,
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model("Notification", notificationSchema)