// const User = require("../models/User.model");
// const jwt = require("jsonwebtoken");
// const sendEmail = require("../utils/sendEmail");
// const generateOTP = require("../utils/generateOTP");

// // Generate JWT Token
// const generateToken = (id) => {
//   console.log("🔐 Generating token for user:", id);
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });
// };

// // ==================== REGISTER ====================
// exports.registerUser = async (req, res) => {
//   console.log("📥 Register API Hit");
//   console.log("Request Body:", req.body);

//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       console.log("❌ Missing fields in registration");
//       return res.status(400).json({
//         success: false,
//         message: "Please fill all fields",
//       });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       console.log("⚠️ Email already registered:", email);
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered. Please login.",
//       });
//     }

//     const user = await User.create({ name, email, password });
//     console.log("✅ User created:", user._id);

//     const token = generateToken(user._id);

//     res.status(201).json({
//       success: true,
//       message: "Account created successfully!",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.log("🔥 Register Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Server error during registration",
//     });
//   }
// };

// // ==================== LOGIN ====================
// exports.loginUser = async (req, res) => {
//   console.log("📥 Login API Hit");
//   console.log("Login Email:", req.body.email);

//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       console.log("❌ Missing login fields");
//       return res.status(400).json({
//         success: false,
//         message: "Please enter email and password",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("❌ User not found:", email);
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     const isPasswordMatch = await user.comparePassword(password);
//     console.log("🔎 Password Match:", isPasswordMatch);

//     if (!isPasswordMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     const token = generateToken(user._id);
//     console.log("✅ Login successful for:", user._id);

//     res.status(200).json({
//       success: true,
//       message: "Login successful!",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.log("🔥 Login Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Server error during login",
//     });
//   }
// };

// // ==================== GET PROFILE ====================
// exports.getProfile = async (req, res) => {
//   console.log("📥 Get Profile API Hit");
//   console.log("User ID from token:", req.user?._id);

//   try {
//     const user = await User.findById(req.user._id).select(
//       "-password -resetOTP -resetOTPExpiry",
//     );

//     console.log("✅ Profile fetched");

//     res.status(200).json({
//       success: true,
//       user,
//     });
//   } catch (error) {
//     console.log("🔥 Get Profile Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ==================== FORGOT PASSWORD ====================
// exports.forgotPassword = async (req, res) => {
//   console.log("📥 Forgot Password API Hit");
//   console.log("Email:", req.body.email);

//   try {
//     const { email } = req.body;

//     if (!email) {
//       console.log("❌ Email missing");
//       return res.status(400).json({
//         success: false,
//         message: "Please provide your email",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("❌ No account found:", email);
//       return res.status(404).json({
//         success: false,
//         message: "No account found with this email",
//       });
//     }

//     const otp = generateOTP();
//     console.log("🔑 Generated OTP:", otp);

//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

//     user.resetOTP = otp;
//     user.resetOTPExpiry = otpExpiry;
//     await user.save({ validateBeforeSave: false });

//     console.log("📧 Sending OTP email...");

//     await sendEmail({
//       to: user.email,
//       subject: "Password Reset OTP - Valid for 10 Minutes",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 12px;">
//           <h2 style="color: #6C63FF; text-align: center;">AuthApp - Password Reset</h2>
//           <p style="color: #555; text-align: center;">Your OTP code is:</p>
//           <div style="text-align: center; margin: 20px 0;">
//             <span style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #6C63FF;">${otp}</span>
//           </div>
//           <p style="color: #888; text-align: center;">This OTP is valid for <strong>10 minutes</strong>.</p>
//           <p style="color: #aaa; text-align: center; font-size: 12px;">If you didn't request this, please ignore this email.</p>
//         </div>
//       `,
//     });

//     console.log("✅ OTP Email Sent");

//     res.status(200).json({
//       success: true,
//       message: `OTP sent to ${email}`,
//     });
//   } catch (error) {
//     console.log("🔥 Forgot Password Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Error sending OTP email",
//     });
//   }
// };

// // ==================== VERIFY OTP ====================
// exports.verifyOTP = async (req, res) => {
//   console.log("📥 Verify OTP API Hit");
//   console.log("Email:", req.body.email, "OTP:", req.body.otp);

//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });
//     if (!user || user.resetOTP !== otp) {
//       console.log("❌ Invalid OTP");
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     if (user.resetOTPExpiry < Date.now()) {
//       console.log("⏰ OTP expired");
//       return res.status(400).json({
//         success: false,
//         message: "OTP expired",
//       });
//     }

//     console.log("✅ OTP Verified");

//     res.status(200).json({
//       success: true,
//       message: "OTP verified successfully!",
//     });
//   } catch (error) {
//     console.log("🔥 Verify OTP Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // ==================== RESET PASSWORD ====================
// exports.resetPassword = async (req, res) => {
//   console.log("📥 Reset Password API Hit");
//   console.log("Email:", req.body.email);

//   try {
//     const { email, otp, newPassword } = req.body;

//     const user = await User.findOne({ email });
//     if (!user || user.resetOTP !== otp) {
//       console.log("❌ Invalid OTP for reset");
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     if (user.resetOTPExpiry < Date.now()) {
//       console.log("⏰ OTP expired during reset");
//       return res.status(400).json({
//         success: false,
//         message: "OTP expired",
//       });
//     }

//     user.password = newPassword;
//     user.resetOTP = null;
//     user.resetOTPExpiry = null;

//     await user.save();

//     console.log("✅ Password Reset Successful");

//     res.status(200).json({
//       success: true,
//       message: "Password reset successfully!",
//     });
//   } catch (error) {
//     console.log("🔥 Reset Password Error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOTP");

// ==================== GENERATE TOKEN ====================
const generateToken = (id) => {
  console.log("🔐 Generating token for user:", id);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==================== REGISTER ====================
exports.registerUser = async (req, res) => {
  console.log("📥 Register API Hit");
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered. Please login." });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    console.log("✅ User registered:", user.email);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("🔥 Register Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ==================== LOGIN ====================
exports.loginUser = async (req, res) => {
  console.log("📥 Login API Hit — email:", req.body.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    console.log("✅ Login success:", user.email);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("🔥 Login Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ==================== GET PROFILE ====================
// ✅ FIXED: ab ye sahi se kaam karega — protect middleware se req.user aata hai
exports.getProfile = async (req, res) => {
  console.log("📥 Get Profile Hit — user ID:", req.user?._id);
  try {
    // req.user already protect middleware mein set ho gaya
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const user = await User.findById(req.user._id).select(
      "-password -resetOTP -resetOTPExpiry"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("✅ Profile fetched for:", user.email);
    res.status(200).json({ success: true, user });

  } catch (error) {
    console.log("🔥 Profile Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FORGOT PASSWORD ====================
// ✅ Jo bhi email dalo — us par OTP jayega
exports.forgotPassword = async (req, res) => {
  console.log("📥 Forgot Password Hit — email:", req.body.email);
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide your email" });
    }

    // ✅ Us email se registered user dhundhta hai
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log("❌ No user found with email:", email);
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // OTP generate karo
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    console.log("💾 OTP saved — now sending email to:", user.email);

    // ✅ OTP us user ki email par bhejo
    await sendEmail({
      to: user.email, // ← jis ne email daali, usi ko jayega
      subject: "🔐 Password Reset OTP - AuthApp",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"/></head>
        <body style="margin:0;padding:0;background-color:#0f0f1a;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0"
                  style="background:linear-gradient(135deg,#1a1a2e,#16213e);
                         border:1px solid #2d2d4e;border-radius:16px;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td align="center"
                      style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;">
                      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">
                        ⚡ AuthApp
                      </h1>
                      <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">
                        Password Reset Request
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="color:#94a3b8;font-size:15px;margin:0 0 16px;">
                        Hi <strong style="color:#e2e8f0;">${user.name}</strong>,
                      </p>
                      <p style="color:#94a3b8;font-size:14px;margin:0 0 28px;line-height:1.7;">
                        We received a password reset request for your account
                        (<strong style="color:#a5b4fc;">${user.email}</strong>).
                        Use the OTP code below:
                      </p>

                      <!-- OTP Box -->
                      <div style="background:rgba(79,70,229,0.15);
                                  border:2px solid rgba(99,102,241,0.4);
                                  border-radius:12px;padding:30px;text-align:center;
                                  margin-bottom:28px;">
                        <p style="color:#a5b4fc;font-size:11px;text-transform:uppercase;
                                   letter-spacing:3px;margin:0 0 14px;font-weight:700;">
                          Your One-Time Password
                        </p>
                        <div style="font-size:52px;font-weight:900;letter-spacing:16px;
                                    color:#ffffff;font-family:'Courier New',monospace;">
                          ${otp}
                        </div>
                        <p style="color:#64748b;font-size:13px;margin:14px 0 0;">
                          ⏱️ Expires in <strong style="color:#f59e0b;">10 minutes</strong>
                        </p>
                      </div>

                      <!-- Security warning -->
                      <div style="background:rgba(239,68,68,0.08);
                                  border:1px solid rgba(239,68,68,0.25);
                                  border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                        <p style="color:#fca5a5;font-size:13px;margin:0;line-height:1.6;">
                          🔒 <strong>Never share this OTP</strong> with anyone.
                          AuthApp team will never ask for your OTP.
                        </p>
                      </div>

                      <p style="color:#475569;font-size:13px;margin:0;
                                text-align:center;line-height:1.6;">
                        Didn't request this? You can safely ignore this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="border-top:1px solid #2d2d4e;padding:18px 40px;text-align:center;">
                      <p style="color:#334155;font-size:12px;margin:0;">
                        © 2025 AuthApp • Secure Authentication System
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("✅ OTP sent to:", user.email);
    res.status(200).json({
      success: true,
      message: `OTP sent to ${user.email}`,
    });

  } catch (error) {
    console.log("🔥 Forgot Password Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Check your email config in .env",
    });
  }
};

// ==================== VERIFY OTP ====================
exports.verifyOTP = async (req, res) => {
  console.log("📥 Verify OTP Hit");
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    if (!user.resetOTP || user.resetOTP !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    if (user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    console.log("✅ OTP verified for:", email);
    res.status(200).json({ success: true, message: "OTP verified successfully!" });

  } catch (error) {
    console.log("🔥 Verify OTP Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== RESET PASSWORD ====================
exports.resetPassword = async (req, res) => {
  console.log("📥 Reset Password Hit");
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found" });
    }

    if (!user.resetOTP || user.resetOTP !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    console.log("✅ Password reset for:", email);
    res.status(200).json({
      success: true,
      message: "Password reset successfully! Please login with your new password.",
    });

  } catch (error) {
    console.log("🔥 Reset Password Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};