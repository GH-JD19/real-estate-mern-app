const mongoose = require("mongoose")

const visitSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    visitDate: {
      type: Date,
      required: true
    },

    message: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
      default: "PENDING"
    }

  },
  { timestamps: true }
)

module.exports = mongoose.model("Visit", visitSchema)