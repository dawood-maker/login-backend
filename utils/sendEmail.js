const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Auth App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
  const nodemailer = require("nodemailer");

  const sendEmail = async ({ to, subject, html }) => {
    console.log("📧 Preparing to send email...");
    console.log("To:", to);
    console.log("Subject:", subject);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Do not log password
      },
    });

    const mailOptions = {
      from: `"Auth App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.response);
    } catch (error) {
      console.log("🔥 Error sending email:", error.message);
      throw error;
    }
  };

  module.exports = sendEmail;
};

module.exports = sendEmail;
