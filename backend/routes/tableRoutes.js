const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getTables, addTable, updateTable, deleteTable } = require('../controllers/tableController');

// Admin-only middleware
function adminOnly(req, res, next) {
  if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

// Routes
router.get('/', auth, getTables);                     // Anyone logged in can view tables
router.post('/', auth, adminOnly, addTable);         // Only admin can add
router.put('/', auth, adminOnly, updateTable);       // Only admin can update
router.delete('/:id', auth, adminOnly, deleteTable);// Only admin can delete

module.exports = router;
