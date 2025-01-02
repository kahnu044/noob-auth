const express = require("express");
const {
  register,
  login,
  googleOAuth,
  googleOAuthCallback,
  validateToken,
  logout,
} = require("../controllers/authController");

const checkClientUrl = require("../middlewares/checkClientUrl");
const isAuthorized = require("../middlewares/isAuthorized");
const logger = require("../middlewares/logger");

const router = express.Router();
router.use(logger);

// Register route (email/password)
router.post("/register", register);
router.post("/login", login);
router.post("/login", login);
router.post("/logout", checkClientUrl, isAuthorized, logout);

// Google OAuth routes
router.get("/google", googleOAuth);
router.get("/google/callback", googleOAuthCallback);

router.get("/validate", checkClientUrl, isAuthorized, validateToken);

module.exports = router;
