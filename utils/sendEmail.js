// const nodemailer = require("nodemailer");

// const sendEmail = async ({ to, subject, html }) => {
//   console.log("📧 Preparing to send email...", to);

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: `"Auth App" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", info.response);
//   } catch (error) {
//     console.log("🔥 Error sending email:", error.message);
//     throw error;
//   }
// };

// module.exports = sendEmail;








const nodemailer = require("nodemailer");

// ✅ Ye function kisi bhi email par OTP bhejta hai
// "to" field mein jo bhi email aaye, wahan OTP jayega
const sendEmail = async ({ to, subject, html }) => {
  console.log("📧 Sending email to:", to);
  console.log("📧 From account:", process.env.EMAIL_USER);

  // ✅ Gmail SMTP transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER, // aapka gmail — ye SENDER hai
      pass: process.env.EMAIL_PASS, // Gmail App Password (16 digits)
    },
    tls: {
      rejectUnauthorized: false,
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