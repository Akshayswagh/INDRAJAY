const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");

    // Log specific error reasons
    if (error.name === "MongoNetworkError") {
      console.error("🔌 Network error: Could not reach MongoDB server.");
      console.error(
        "📡 Check your internet, firewall, or IP whitelist in MongoDB Atlas."
      );
    } else if (error.name === "MongooseServerSelectionError") {
      console.error(
        "⛔ Server selection error: Unable to connect to MongoDB cluster."
      );
    } else if (error.message.includes("authentication failed")) {
      console.error(
        "🔐 Authentication failed: Check your MongoDB credentials."
      );
    }

    // Full error details
    console.error("📄 Error Details:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
