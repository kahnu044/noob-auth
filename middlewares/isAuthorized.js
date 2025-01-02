const jwt = require("jsonwebtoken");

const isAuthorized = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Please provide authorization token in header",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: false, message: "Unauthorized access", error: err?.message });
  }
};

module.exports = isAuthorized;
