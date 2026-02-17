const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    resetOTP: {
      type: String,
      default: null,
    },
    resetOTPExpiry: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  console.log("💾 Pre-save hook triggered for:", this.email);

  if (!this.isModified("password")) {
    console.log("🔁 Password not modified");
    return next();
  }

  try {
    console.log("🔒 Hashing password...");
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("✅ Password hashed successfully");
    next();
  } catch (error) {
    console.log("🔥 Error while hashing password:", error.message);
    next(error);
  }
});

// 🔍 Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  console.log("🔎 Comparing password for:", this.email);
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log("🔐 Password match result:", isMatch);
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
