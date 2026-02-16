const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Token header se lo
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("[PROTECT] Token found in headers:", token);
    } else {
      console.log("[PROTECT] No token provided in headers");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login first.",
      });
    }

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[PROTECT] Token decoded:", decoded);

    // User find karo database mein
    const user = await User.findById(decoded.id).select("-password");
    console.log("[PROTECT] User found:", user?.email);

    if (!user) {
      console.log("[PROTECT] No user found with this ID");
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    if (!user.isVerified) {
      console.log("[PROTECT] User account not verified:", user.email);
      return res.status(401).json({
        success: false,
        message: "Account not verified. Please verify your email.",
        needsVerification: true,
        email: user.email,
      });
    }

    console.log("[PROTECT] User authorized:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("[PROTECT] Error:", error);

    if (error.name === "JsonWebTokenError") {
      console.log("[PROTECT] Invalid JWT token");
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      console.log("[PROTECT] JWT token expired");
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { protect };
