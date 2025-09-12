const express = require('express');
const router = express.Router();
const { getUsers, addUser, updateUser, deleteUser } = require('../controllers/userController');

router.get('/', getUsers);            // GET /api/users
router.post('/', addUser);            // POST /api/users
router.put('/', updateUser);          // PUT /api/users
router.delete('/:id', deleteUser);    // DELETE /api/users/:id

module.exports = router;
