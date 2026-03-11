const mongoose = require("mongoose")

const propertySchema = new mongoose.Schema(
  {
    // BASIC INFO
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      uppercase: true
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },

    priceNegotiable: {
      type: Boolean,
      default: false
    },

    type: {
      type: String,
      enum: [
        "APARTMENT",
        "HOUSE",
        "VILLA",
        "PLOT",
        "LAND",
        "COMMERCIAL",
        "SHOP",
        "OFFICE",
        "WAREHOUSE",
        "PG",
        "BUILDER_FLOOR",
        "PENTHOUSE",
        "STUDIO"
      ],
      required: true
    },

    purpose: {
      type: String,
      enum: ["BUY", "RENT", "SELL"],
      required: true,
      index: true
    },

    // LOCATION
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      uppercase: true
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      uppercase: true,
      index: true
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      uppercase: true
    },

    pincode: {
      type: Number,
      required: [true, "Pincode is required"],
      min: [100000, "Invalid pincode"],
      max: [999999, "Invalid pincode"]
    },

    location: {
      lat: Number,
      lng: Number
    },

    // PROPERTY DETAILS
    bedrooms: {
      type: Number,
      default: 0
    },

    bathrooms: {
      type: Number,
      default: 0
    },

    balconies: {
      type: Number,
      default: 0
    },

    area: {
      type: Number,
      default: 0
    },

    floor: Number,

    totalFloors: Number,

    furnishing: {
      type: String,
      enum: ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"]
    },

    propertyAge: {
      type: String,
      enum: ["NEW", "1-5 YEARS", "5-10 YEARS", "10+ YEARS"]
    },

    facing: {
      type: String,
      enum: [
        "NORTH",
        "SOUTH",
        "EAST",
        "WEST",
        "NORTHEAST",
        "NORTHWEST",
        "SOUTHEAST",
        "SOUTHWEST"
      ]
    },

    parking: {
      type: String,
      enum: ["NONE", "BIKE", "CAR", "BOTH"]
    },

    maintenanceCharge: Number,

    // AMENITIES
    amenities: [{
      type: String,
      enum: [
        "LIFT",
        "GYM",
        "POOL",
        "SECURITY",
        "PARKING",
        "GARDEN",
        "POWER_BACKUP",
        "CLUBHOUSE",
        "PLAY_AREA",
        "WIFI"
      ]
    }],

    // MEDIA
    media: {
      images: [String],
      videoTour: String,
      floorPlan: String
    },

    // VISIBILITY
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true
    },

    featured: {
      type: Boolean,
      default: false,
      index: true
    },

    featuredTill: Date,

    isVerified: {
      type: Boolean,
      default: false
    },

    views: {
      type: Number,
      default: 0
    },

    // BOOKING READY
    availableFrom: Date,

    isBooked: {
      type: Boolean,
      default: false
    },

    // USER / AGENT
    listedByRole: {
      type: String,
      enum: ["ADMIN", "AGENT", "OWNER"],
      default: "OWNER"
    },

    contactNumber: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // WISHLIST
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    // ADMIN
    approvedAt: Date,

    rejectedReason: String,

    // AI READY
    tags: [String]
  },
  { timestamps: true }
)

// SEARCH INDEX
propertySchema.index({
  title: "text",
  city: "text",
  state: "text"
})

module.exports = mongoose.model("Property", propertySchema)