const express = require("express");
const {
  register,
  login,
  googleOAuth,
  googleOAuthCallback,
} = require("../controllers/authController");
const router = express.Router();

// Register route (email/password)
router.post("/register", register);
router.post("/login", login);

// Google OAuth routes
router.get("/auth/google", googleOAuth);
router.get("/auth/google/callback", googleOAuthCallback);

module.exports = router;
