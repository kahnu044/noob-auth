const express = require("express");
const {
  register,
  login,
  googleOAuth,
  googleOAuthCallback,
} = require("../controllers/authController");
const isAuthorized = require("../middlewares/isAuthorized");
const router = express.Router();

router.use(isAuthorized);

// Register route (email/password)
router.post("/register", register);
router.post("/login", login);

// Google OAuth routes
router.get("/auth/google", googleOAuth);
router.get("/auth/google/callback", googleOAuthCallback);

module.exports = router;
