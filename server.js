const express = require("express");
require("dotenv").config();

const config = require("./config/development");
const db = require("./config/db");

const app = express();
app.use(express.json());

// Connect to Database
db.connectDB();

// Routes
app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    message: "Welcome to the NoobAuth Server",
  });
});

// Start the server
app.listen(config.PORT, () => {
  console.log(
    `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
  );
});
