const mongoose = require("mongoose")

const propertySchema = new mongoose.Schema(
  {
    // ============================
    // BASIC INFO
    // ============================
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      uppercase: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
      index: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      index: true,
    },

    priceNegotiable: {
      type: Boolean,
      default: false,
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
        "STUDIO",
      ],
      required: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: ["BUY", "RENT", "SELL"],
      required: true,
      index: true,
    },

    // ============================
    // LOCATION (PRODUCTION READY)
    // ============================
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      uppercase: true,
      maxlength: [300, "Address too long"],
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      uppercase: true,
      index: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      uppercase: true,
      index: true,
    },

    pincode: {
      type: Number,
      required: [true, "Pincode is required"],
      min: [100000, "Invalid pincode"],
      max: [999999, "Invalid pincode"],
      index: true,
    },

    // ✅ GEOJSON LOCATION (FIXED)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: "2dsphere",
      },
    },

    // ============================
    // PROPERTY DETAILS
    // ============================
    bedrooms: { type: Number, default: 0, min: 0, max: 20 },
    bathrooms: { type: Number, default: 0, min: 0, max: 20 },
    balconies: { type: Number, default: 0, min: 0, max: 20 },
    area: { type: Number, default: 0, min: 0 },
    floor: { type: Number, min: 0 },
    totalFloors: { type: Number, min: 0 },

    furnishing: {
      type: String,
      enum: ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"],
    },

    propertyAge: {
      type: String,
      enum: ["NEW", "1-5 YEARS", "5-10 YEARS", "10+ YEARS"],
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
        "SOUTHWEST",
      ],
    },

    parking: {
      type: String,
      enum: ["NONE", "BIKE", "CAR", "BOTH"],
    },

    maintenanceCharge: {
      type: Number,
      min: 0,
    },

    // ============================
    // AMENITIES
    // ============================
    amenities: [
      {
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
          "WIFI",
        ],
      },
    ],

    // ============================
    // MEDIA
    // ============================
    media: {
      images: {
        type: [String],
        default: [],
      },

      videoTour: {
        type: String,
        validate: {
          validator: (v) => !v || /^https?:\/\/.+/.test(v),
          message: "Invalid video URL",
        },
      },

      floorPlan: {
        type: String,
        validate: {
          validator: (v) => !v || /^https?:\/\/.+/.test(v),
          message: "Invalid floor plan URL",
        },
      },
    },

    // ============================
    // VISIBILITY
    // ============================
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    featuredTill: Date,

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============================
    // BOOKING
    // ============================
    availableFrom: Date,

    isBooked: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ============================
    // USER
    // ============================
    listedByRole: {
      type: String,
      enum: ["ADMIN", "AGENT", "OWNER"],
      default: "OWNER",
    },

    contactNumber: {
      type: String,
      minlength: 10,
      maxlength: 10,
      validate: {
        validator: (v) => !v || /^[6-9]\d{9}$/.test(v),
        message: "Invalid contact number",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ============================
    // WISHLIST
    // ============================
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ============================
    // ADMIN
    // ============================
    approvedAt: Date,

    rejectedReason: {
      type: String,
      maxlength: [500, "Reason too long"],
    },

    // ============================
    // AI / TAGS
    // ============================
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // ✅ SOFT DELETE
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// ============================
// 🔍 TEXT SEARCH
// ============================
propertySchema.index({
  title: "text",
  description: "text",
  city: "text",
  state: "text",
  tags: "text",
})

// ============================
// ⚡ PERFORMANCE INDEXES
// ============================
propertySchema.index({ city: 1, type: 1, price: 1 })
propertySchema.index({ purpose: 1, status: 1 })
propertySchema.index({ createdBy: 1, createdAt: -1 })
propertySchema.index({ price: 1, createdAt: -1 })

// ============================
// 🛡️ DATA CLEANUP
// ============================
propertySchema.pre("save", function (next) {
  if (this.contactNumber) {
    this.contactNumber = this.contactNumber.replace(/\D/g, "")
  }

  if (
    this.floor !== undefined &&
    this.totalFloors !== undefined &&
    this.floor > this.totalFloors
  ) {
    return next(new Error("Floor cannot be greater than total floors"))
  }

  next()
})

module.exports = mongoose.model("Property", propertySchema)