const nodemailer = require("nodemailer");

// ✅ Ye function kisi bhi email par OTP bhejta hai
// "to" field mein jo bhi email aaye, wahan OTP jayega
const sendEmail = async ({ to, subject, html }) => {
  console.log("📧 Sending email to:", to);
  console.log("📧 From account:", process.env.EMAIL_USER);

  // ✅ Gmail SMTP transporter
  const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "92015b47d055a6",
    pass: "aad5e3441101f8"
  },
  });

  const mailOptions = {
    from: `"AuthApp 🔐" <${process.env.EMAIL_USER}>`, // sender
    to: to, // ✅ recipient — jo bhi user ne email daali wo yahan aayegi
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to);
    console.log("📬 Response:", info.response);
    return info;
  } catch (error) {
    console.log("🔥 Email Error:", error.message);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;