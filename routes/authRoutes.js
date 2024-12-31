const express = require('express');
const { register } = require('../controllers/authController');
const router = express.Router();

// Register route (email/password)
router.post('/register', register);

module.exports = router;
