const crypto = require("crypto");

const generateOTP = () => {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("🔑 Generated OTP:", otp); // Debug log
  return otp;
};

module.exports = generateOTP;
