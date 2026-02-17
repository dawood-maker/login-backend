const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("🔄 Connecting to MongoDB..."); // yeh log add kiya

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ Connection Failed"); // extra log
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
