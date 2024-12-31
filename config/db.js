const mongoose = require("mongoose");
const config = require("./development.js");
const connectDB = async () => {
  if (!config.MONGO_URI) {
    console.error("MONGO_URI is not defined in the environment variables");
    process.exit(1);
  }

  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("MongoDB Connected to...", config.MONGO_URI);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
