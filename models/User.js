const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Default mein password na aaye
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      purpose: {
        type: String,
        enum: ["register", "forgot", "change_email"],
        default: null,
      },
    },
    pendingEmail: {
      type: String,
      default: null, // Email change ke liye naya email temporarily store karo
    },
  },
  { timestamps: true },
);

// ===== Password hash karo save se pehle =====
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log("[USER MODEL] Hashing password for:", this.email);
  this.password = await bcrypt.hash(this.password, 12);
  console.log("[USER MODEL] Password hashed successfully");
  next();
});

// ===== Password compare =====
userSchema.methods.comparePassword = async function (entered) {
  const match = await bcrypt.compare(entered, this.password);
  console.log(
    `[USER MODEL] Comparing password for ${this.email}: entered="${entered}", match=${match}`,
  );
  return match;
};

// ===== OTP Generate karo =====
userSchema.methods.generateOTP = function (purpose) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const mins = parseInt(process.env.OTP_EXPIRE) || 10;

  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + mins * 60 * 1000),
    purpose,
  };
  console.log(
    `[USER MODEL] OTP generated for ${this.email} (${purpose}):`,
    otp,
    "Expires at:",
    this.otp.expiresAt,
  );
  return otp;
};

// ===== OTP Verify karo =====
userSchema.methods.verifyOTP = function (code, purpose) {
  console.log(
    `[USER MODEL] Verifying OTP for ${this.email}: entered="${code}", purpose="${purpose}"`,
  );
  if (!this.otp.code)
    return { valid: false, msg: "OTP not found. Please request again." };
  if (this.otp.purpose !== purpose)
    return { valid: false, msg: "Invalid OTP type." };
  if (this.otp.expiresAt < new Date())
    return { valid: false, msg: "OTP has expired. Please request again." };
  if (this.otp.code !== code)
    return { valid: false, msg: "Invalid OTP. Please check and try again." };

  console.log(`[USER MODEL] OTP verified successfully for ${this.email}`);
  return { valid: true };
};

// ===== OTP Clear karo =====
userSchema.methods.clearOTP = function () {
  console.log(`[USER MODEL] Clearing OTP for ${this.email}`);
  this.otp = { code: null, expiresAt: null, purpose: null };
};

module.exports = mongoose.model("User", userSchema);
