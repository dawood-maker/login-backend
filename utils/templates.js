// utils/templates.js
const otpTemplate = (name, otp, heading, color = "#6366f1") => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: ${color};">${heading}</h2>
      <p>Hello ${name},</p>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
};

module.exports = { otpTemplate };
