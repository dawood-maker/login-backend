// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// require("dotenv").config();

// const authRoutes = require("./routes/auth");

// const app = express();

// // ===== MIDDLEWARE =====
// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true }));

// // Request logger
// app.use((req, res, next) => {
//   console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, req.body);
//   next();
// });

// // CORS - React frontend ko allow karo
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

// // Rate Limiting - brute force se bachao
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message: {
//     success: false,
//     message: "Too many requests. Please try again later.",
//   },
// });
// app.use("/api/", limiter);

// // ===== MONGODB CONNECTION =====
// mongoose
//   .connect(process.env.MONGODB_URI)
//   .then(() => console.log("✅ MongoDB Connected Successfully"))
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err.message);
//     process.exit(1);
//   });

// // ===== ROUTES =====
// app.use(
//   "/api/auth",
//   (req, res, next) => {
//     console.log(`[ROUTE] /api/auth hit - ${req.method}`);
//     next();
//   },
//   authRoutes,
// );

// // Health check
// app.get("/", (req, res) => {
//   console.log("[HEALTH CHECK] Root endpoint hit");
//   res.json({
//     success: true,
//     message: "Auth API is running!",
//     version: "1.0.0",
//     endpoints: {
//       register: "POST /api/auth/register",
//       verifyOTP: "POST /api/auth/verify-otp",
//       resendOTP: "POST /api/auth/resend-otp",
//       login: "POST /api/auth/login",
//       logout: "POST /api/auth/logout",
//       forgotPassword: "POST /api/auth/forgot-password",
//       verifyForgotOTP: "POST /api/auth/verify-forgot-otp",
//       resetPassword: "POST /api/auth/reset-password",
//       changePassword: "PUT /api/auth/change-password",
//       changeEmailRequest: "POST /api/auth/change-email-request",
//       changeEmailVerify: "POST /api/auth/change-email-verify",
//       getMe: "GET /api/auth/me",
//     },
//   });
// });

// // 404 Handler
// app.use("*", (req, res) => {
//   console.log(`[404] Route not found: ${req.method} ${req.url}`);
//   res.status(404).json({ success: false, message: "Route not found." });
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error("[GLOBAL ERROR] Error caught:", err);
//   res.status(500).json({ success: false, message: "Internal server error." });
// });

// // ===== START SERVER =====
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });






const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();
connectDB();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));

const limiter = rateLimit({ windowMs: 15*60*1000, max: 100, message: "Too many requests" });
app.use("/api/", limiter);

app.use("/api/auth", authRoutes);

app.get("/", (req,res)=>res.json({ message:"Auth API running!" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`🚀 Server running on port ${PORT}`));