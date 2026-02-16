// // ─── REGISTER ────────────────────────────────────────────────────────────────
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     console.log("[REGISTER] Request body:", req.body);

//     if (!name || !email || !password) {
//       console.log("[REGISTER] Missing fields");
//       return res
//         .status(400)
//         .json({ success: false, message: "Please fill all fields." });
//     }

//     if (password.length < 6) {
//       console.log("[REGISTER] Password too short");
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Password must be at least 6 characters.",
//         });
//     }

//     let user = await User.findOne({ email });
//     console.log("[REGISTER] Existing user:", user);

//     if (user?.isVerified) {
//       console.log("[REGISTER] Email already verified");
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: "Email already registered. Please login.",
//         });
//     }

//     if (user) {
//       user.name = name;
//       user.password = password;
//     } else {
//       user = new User({ name, email, password });
//     }

//     const otp = user.generateOTP("register");
//     console.log("[REGISTER] Generated OTP:", otp);
//     await user.save();

//     await sendEmail(
//       email,
//       "Verify Your Account",
//       otpTemplate(name, otp, "Verify Account", "#6366f1"),
//     );
//     console.log("[REGISTER] OTP sent to email:", email);

//     res.status(200).json({
//       success: true,
//       message: `OTP sent to ${email}. Please verify your account.`,
//       email,
//     });
//   } catch (err) {
//     console.error("[REGISTER] Error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error. Please try again." });
//   }
// });

// // ─── VERIFY OTP ───────────────────────────────────────────────────────────────
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     console.log("[VERIFY OTP] Request body:", req.body);

//     const user = await User.findOne({ email });
//     console.log("[VERIFY OTP] Found user:", user);

//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found." });

//     const result = user.verifyOTP(otp, "register");
//     console.log("[VERIFY OTP] OTP verification result:", result);

//     if (!result.valid)
//       return res.status(400).json({ success: false, message: result.msg });

//     user.isVerified = true;
//     user.clearOTP();
//     await user.save();
//     console.log("[VERIFY OTP] User verified:", user.email);

//     const token = generateToken(user._id);

//     res.status(200).json({
//       success: true,
//       message: "Account verified! Welcome 🎉",
//       token,
//       user: { id: user._id, name: user.name, email: user.email },
//     });
//   } catch (err) {
//     console.error("[VERIFY OTP] Error:", err);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// });

// // ─── LOGIN ───────────────────────────────────────────────────────────────────
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log("[LOGIN] Request body:", req.body);

//     const user = await User.findOne({ email }).select("+password");
//     console.log("[LOGIN] Found user:", user);

//     if (!user)
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid email or password." });
//     if (!user.isVerified) {
//       console.log("[LOGIN] User not verified:", email);
//       return res
//         .status(401)
//         .json({
//           success: false,
//           message: "Account not verified.",
//           needsVerification: true,
//           email,
//         });
//     }

//     const match = await user.comparePassword(password);
//     console.log("[LOGIN] Password match:", match);

//     if (!match)
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid email or password." });

//     const token = generateToken(user._id);
//     console.log("[LOGIN] User logged in, token generated:", token);

//     res.status(200).json({
//       success: true,
//       message: `Welcome back, ${user.name}! 👋`,
//       token,
//       user: { id: user._id, name: user.name, email: user.email },
//     });
//   } catch (err) {
//     console.error("[LOGIN] Error:", err);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// });

// // ─── RESET PASSWORD EXAMPLE ──────────────────────────────────────────────────
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     console.log("[RESET PASSWORD] Request body:", req.body);

//     const user = await User.findOne({ email });
//     console.log("[RESET PASSWORD] Found user:", user);

//     if (!user)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found." });

//     const result = user.verifyOTP(otp, "forgot");
//     console.log("[RESET PASSWORD] OTP verification result:", result);

//     if (!result.valid)
//       return res.status(400).json({ success: false, message: result.msg });

//     user.password = newPassword;
//     user.clearOTP();
//     await user.save();
//     console.log("[RESET PASSWORD] Password updated for:", email);

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "Password reset successfully! Please login.",
//       });
//   } catch (err) {
//     console.error("[RESET PASSWORD] Error:", err);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// });


// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const { otpTemplate } = require("../utils/templates");
const { generateToken } = require("../utils/jwt");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Fill all fields" });

    let user = await User.findOne({ email });
    if (user && user.isVerified) return res.status(400).json({ message: "Email already registered" });

    if (user) { user.name = name; user.password = password; }
    else { user = new User({ name, email, password }); }

    const otp = user.generateOTP();
    await user.save();

    await sendEmail(email, "Verify Your Account", otpTemplate(name, otp, "Verify Account"));

    res.status(200).json({ message: `OTP sent to ${email}` });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.verifyOTP(otp)) return res.status(400).json({ message: "Invalid OTP" });

  user.isVerified = true;
  user.clearOTP();
  await user.save();
  const token = generateToken(user._id);
  res.json({ message: "Verified", token });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(401).json({ message: "Invalid email or password" });
  if (!user.isVerified) return res.status(401).json({ message: "Account not verified" });

  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ message: "Invalid email or password" });

  const token = generateToken(user._id);
  res.json({ message: "Logged in", token });
});

module.exports = router;