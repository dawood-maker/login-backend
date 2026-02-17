const express = require("express");
const router = express.Router();

console.log("📦 Auth Routes Loaded");

const {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/auth.controller");

// ================= ROUTES =================

router.post(
  "/register",
  (req, res, next) => {
    console.log("📥 /register route hit");
    next();
  },
  registerUser,
);

router.post(
  "/login",
  (req, res, next) => {
    console.log("📥 /login route hit");
    next();
  },
  loginUser,
);

router.get(
  "/profile",
  (req, res, next) => {
    console.log("📥 /profile route hit");
    next();
  },
  getProfile,
);

router.post(
  "/forgot-password",
  (req, res, next) => {
    console.log("📥 /forgot-password route hit");
    next();
  },
  forgotPassword,
);

router.post(
  "/verify-otp",
  (req, res, next) => {
    console.log("📥 /verify-otp route hit");
    next();
  },
  verifyOTP,
);

router.post(
  "/reset-password",
  (req, res, next) => {
    console.log("📥 /reset-password route hit");
    next();
  },
  resetPassword,
);

module.exports = router;
