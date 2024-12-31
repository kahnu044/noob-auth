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
  const { clientUrl } = req.query;
  if (clientUrl) {
    res.cookie("clientUrl", clientUrl, { httpOnly: true, secure: false });
  }
  res.sendFile(__dirname + "/public/login.html");
});
app.use("/api", authRoutes);

// Start the server
app.listen(config.PORT, () => {
  console.log(
    `Server running in ${config.NODE_ENV} mode on port ${config.PORT}`
  );
});
