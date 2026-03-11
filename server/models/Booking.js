const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },

  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  date: {
    type: Date
  },

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  }

}, { timestamps: true })

module.exports = mongoose.model("Booking", bookingSchema)