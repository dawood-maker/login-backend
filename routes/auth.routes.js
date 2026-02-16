const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

// Public Routes
router.post("/register", register); // POST /api/auth/register
router.post("/login", login); // POST /api/auth/login
router.post("/forgot-password", forgotPassword); // POST /api/auth/forgot-password
router.post("/verify-otp", verifyOTP); // POST /api/auth/verify-otp
router.post("/reset-password", resetPassword); // POST /api/auth/reset-password

// Protected Routes (require token)
router.get("/profile", protect, getProfile); // GET /api/auth/profile

module.exports = router;
