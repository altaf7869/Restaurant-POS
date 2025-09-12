const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // JWT middleware
const { getCategories, addCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

// Public GET (optional) or can require auth
router.get('/', auth, getCategories);

// Admin only routes
router.post('/', auth, addCategory);
router.put('/', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

module.exports = router;
