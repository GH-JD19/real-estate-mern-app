const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      uppercase: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      uppercase: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },

    photo: {
      type: String,
      default: ""
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    resetPasswordToken: {
      type: String
    },

    resetPasswordExpire: {
      type: Date
    },

    role: {
      type: String,
      enum: ["user", "agent", "admin"],
      default: "user",
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: false
    },

    isAgentRequested: {
      type: Boolean,
      default: false,
    },

    agentApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model("User", userSchema)