const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    // ============================
    // BASIC INFO
    // ============================
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      uppercase: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name too long"]
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      uppercase: true,
      maxlength: [300, "Address too long"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Please enter a valid email"
      }
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      minlength: 10,
      maxlength: 10,
      validate: {
        validator: v => /^[6-9]\d{9}$/.test(v),
        message: "Enter a valid 10-digit Indian phone number"
      }
    },

    photo: {
      type: String,
      default: ""
    },

    // ============================
    // SECURITY
    // ============================
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
      validate: {
        validator: v => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v),
        message: "Password must contain at least 1 letter and 1 number"
      }
    },

    resetPasswordToken: {
      type: String,
      select: false
    },

    resetPasswordExpire: {
      type: Date,
      select: false
    },

    // ============================
    // ROLE & STATUS
    // ============================
    role: {
      type: String,
      enum: ["user", "agent", "admin"],
      default: "user",
      index: true
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true
    },

    isActive: {
      type: Boolean,
      default: false
    },

    isAgentRequested: {
      type: Boolean,
      default: false
    },

    agentApproved: {
      type: Boolean,
      default: false
    },

    // ============================
    // SECURITY (BRUTE FORCE PROTECTION)
    // ============================
    loginAttempts: {
      type: Number,
      default: 0
    },

    lockUntil: Date,

    // ============================
    // RELATIONS
    // ============================
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property"
      }
    ],

    // ============================
    // SOFT DELETE
    // ============================
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

/**
 * 🔒 INDEXES
 */
userSchema.index({ createdAt: -1 })

/**
 * 🛡️ NORMALIZATION
 */
userSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim()
  }

  if (this.phone) {
    this.phone = this.phone.replace(/\D/g, "")
  }

  next()
})

/**
 * 🔐 PASSWORD HASHING
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)

  next()
})

/**
 * 🔑 PASSWORD MATCH
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

/**
 * 🧼 REMOVE SENSITIVE DATA
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpire
  delete obj.loginAttempts
  delete obj.lockUntil
  return obj
}

module.exports = mongoose.model("User", userSchema)