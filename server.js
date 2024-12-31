const express = require("express");
const app = express();
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    message: "Welcome to the NoobAuth Server",
  });
});

app.listen(3010, () => console.log("Auth server running on port 3000"));
