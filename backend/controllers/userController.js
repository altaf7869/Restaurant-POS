const userModel = require('../models/userModel');

async function getUsers(req, res) {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addUser(req, res) {
    try {
        const { username, password, fullName, role } = req.body;
        if(!username || !password || !fullName || !role) return res.status(400).json({ message: 'All fields required' });

        await userModel.addUser(username, password, fullName, role);

        res.json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateUser(req, res) {
    try {
        const { id, fullName, role } = req.body;
        if(!id || !fullName || !role) return res.status(400).json({ message: 'Id, fullName, role required' });

        await userModel.updateUser(id, fullName, role);

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        if(!id) return res.status(400).json({ message: 'Id required' });

        await userModel.deleteUser(id);

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getUsers, addUser, updateUser, deleteUser };
