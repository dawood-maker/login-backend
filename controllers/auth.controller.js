const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOTP");

// Generate JWT Token
const generateToken = (id) => {
  console.log("🔐 Generating token for user:", id);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==================== REGISTER ====================
exports.registerUser = async (req, res) => {
  console.log("📥 Register API Hit");
  console.log("Request Body:", req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("❌ Missing fields in registration");
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ Email already registered:", email);
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    const user = await User.create({ name, email, password });
    console.log("✅ User created:", user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("🔥 Register Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// ==================== LOGIN ====================
exports.loginUser = async (req, res) => {
  console.log("📥 Login API Hit");
  console.log("Login Email:", req.body.email);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Missing login fields");
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    console.log("🔎 Password Match:", isPasswordMatch);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);
    console.log("✅ Login successful for:", user._id);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("🔥 Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// ==================== GET PROFILE ====================
exports.getProfile = async (req, res) => {
  console.log("📥 Get Profile API Hit");
  console.log("User ID from token:", req.user?._id);

  try {
    const user = await User.findById(req.user._id).select(
      "-password -resetOTP -resetOTPExpiry",
    );

    console.log("✅ Profile fetched");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("🔥 Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== FORGOT PASSWORD ====================
exports.forgotPassword = async (req, res) => {
  console.log("📥 Forgot Password API Hit");
  console.log("Email:", req.body.email);

  try {
    const { email } = req.body;

    if (!email) {
      console.log("❌ Email missing");
      return res.status(400).json({
        success: false,
        message: "Please provide your email",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ No account found:", email);
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const otp = generateOTP();
    console.log("🔑 Generated OTP:", otp);

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    console.log("📧 Sending OTP email...");

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP - Valid for 10 Minutes",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 12px;">
          <h2 style="color: #6C63FF; text-align: center;">AuthApp - Password Reset</h2>
          <p style="color: #555; text-align: center;">Your OTP code is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #6C63FF;">${otp}</span>
          </div>
          <p style="color: #888; text-align: center;">This OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #aaa; text-align: center; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log("✅ OTP Email Sent");

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}`,
    });
  } catch (error) {
    console.log("🔥 Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error sending OTP email",
    });
  }
};

// ==================== VERIFY OTP ====================
exports.verifyOTP = async (req, res) => {
  console.log("📥 Verify OTP API Hit");
  console.log("Email:", req.body.email, "OTP:", req.body.otp);

  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetOTP !== otp) {
      console.log("❌ Invalid OTP");
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOTPExpiry < Date.now()) {
      console.log("⏰ OTP expired");
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    console.log("✅ OTP Verified");

    res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
    });
  } catch (error) {
    console.log("🔥 Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== RESET PASSWORD ====================
exports.resetPassword = async (req, res) => {
  console.log("📥 Reset Password API Hit");
  console.log("Email:", req.body.email);

  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetOTP !== otp) {
      console.log("❌ Invalid OTP for reset");
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOTPExpiry < Date.now()) {
      console.log("⏰ OTP expired during reset");
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;

    await user.save();

    console.log("✅ Password Reset Successful");

    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.log("🔥 Reset Password Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
