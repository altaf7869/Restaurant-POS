// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware'); // JWT auth middleware

// GET /api/dashboard
router.get('/', auth, getDashboard);

module.exports = router;
