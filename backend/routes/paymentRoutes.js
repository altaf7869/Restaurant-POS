
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getAllPayments } = require('../controllers/paymentController');

// Admin-only middleware
function adminOnly(req, res, next) {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

// Routes
router.get('/', auth, adminOnly, getAllPayments);        
// router.put('/', auth, adminOnly, updatePayment);       
// router.delete('/:id', auth, adminOnly, deletePayment);

module.exports = router;
