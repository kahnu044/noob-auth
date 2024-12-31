const express = require("express");
const cors = require("cors");
require("dotenv").config();

const config = require("./config/development");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to Database
db.connectDB();

// Routes
app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    message: "Welcome to the NoobAuth Server",
  });
});
app.use("/api", authRoutes);

// Start the server
app.listen(config.PORT, () => {
  console.log(
    `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
  );
});