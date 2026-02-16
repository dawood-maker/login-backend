// utils/email.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent to ${to}`);
  } catch (err) {
    console.error("[EMAIL ERROR]", err);
    throw err;
  }
};

module.exports = { sendEmail };
