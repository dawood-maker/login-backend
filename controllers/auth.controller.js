const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOTP");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==================== REGISTER ====================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    // Create new user
    const user = await User.create({ name, email, password });

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
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// ==================== LOGIN ====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

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
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// ==================== GET PROFILE ====================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -resetOTP -resetOTPExpiry",
    );
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== FORGOT PASSWORD (Send OTP) ====================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .otp-box { background: #f0f4ff; border: 2px dashed #4f46e5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 42px; font-weight: bold; color: #4f46e5; letter-spacing: 10px; }
          .warning { color: #ef4444; font-size: 13px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 style="color: #1f2937;">Password Reset OTP</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You requested to reset your password. Use the OTP below:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong> only.</p>
          <p class="warning">⚠️ Never share this OTP with anyone. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">Auth App Team</p>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP - Valid for 10 Minutes",
      html: emailHTML,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}. Please check your inbox.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error sending OTP email",
    });
  }
};

// ==================== VERIFY OTP ====================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.resetOTP || user.resetOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    if (user.resetOTPExpiry < Date.now()) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.resetOTP || user.resetOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully! You can now login with your new password.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
};
