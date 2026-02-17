const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const protect = async (req, res, next) => {
  console.log("🛡️ Protect Middleware Hit");

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("🔑 Token received:", token);
  }

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    console.log("🔍 Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified. Decoded ID:", decoded.id);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.log("❌ User not found in database");
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log("✅ User authenticated:", req.user._id);

    next();
  } catch (err) {
    console.log("🔥 Token verification error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = { protect };
