const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Signup / Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

module.exports = router;
