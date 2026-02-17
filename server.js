const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// 🔌 Connect DB
console.log("🔄 Connecting to MongoDB...");
connectDB();

// 🛠 Middleware
console.log("🛠 Setting up middleware...");

// =================== ✅ CORS CONFIG (FIXED) ===================
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ Preflight requests handle karna ZAROORI hai
app.options("*", cors());

// 🛡 Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📦 Routes
console.log("📦 Loading routes...");
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// 🔍 Test Route
app.get("/", (req, res) => {
  console.log("📥 / route hit");
  res.json({ message: "✅ Server is running!" });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
