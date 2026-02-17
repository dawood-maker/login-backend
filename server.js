const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// 🔌 Connect DB
console.log("🔄 Connecting to MongoDB...");
connectDB(); // connectDB me bhi console.log already hai

// 🛠 Middleware
console.log("🛠 Setting up middleware...");
app.use(cors());
app.use(express.json());

// 📦 Routes
console.log("📦 Loading routes...");
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// 🔍 Test Route
app.get("/", (req, res) => {
  console.log("📥 / route hit");
  res.json({ message: "Server is running!" });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
