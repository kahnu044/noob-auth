const config = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || "development", // 'development', 'production'
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/example_db",
};

module.exports = config;
