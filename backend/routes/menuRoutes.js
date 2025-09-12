const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // JWT auth middleware
const { getMenu, addMenu, updateMenu, deleteMenu } = require('../controllers/menuController');

router.get('/', auth, getMenu);           // GET /api/menu
router.post('/', auth, addMenu);          // POST /api/menu
router.put('/', auth, updateMenu);        // PUT /api/menu
router.delete('/:id', auth, deleteMenu);  // DELETE /api/menu/:id

module.exports = router;
