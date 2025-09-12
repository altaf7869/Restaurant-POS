const menuModel = require('../models/menuModel');

async function getMenu(req, res) {
    try {
        const menuItems = await menuModel.getMenuItems();
        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addMenu(req, res) {
    try {
        const { name, description, price, categoryId } = req.body;
        if(!name || !price || !categoryId) return res.status(400).json({ message: 'Name, price, category required' });
        await menuModel.addMenuItem(name, description || '', price, categoryId);
        res.json({ message: 'Menu item added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateMenu(req, res) {
    try {
        const { id, name, description, price, categoryId } = req.body;
        if(!id || !name || !price || !categoryId) return res.status(400).json({ message: 'Id, name, price, category required' });
        await menuModel.updateMenuItem(id, name, description || '', price, categoryId);
        res.json({ message: 'Menu item updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteMenu(req, res) {
    try {
        const { id } = req.params;
        if(!id) return res.status(400).json({ message: 'Id required' });
        await menuModel.deleteMenuItem(id);
        res.json({ message: 'Menu item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getMenu, addMenu, updateMenu, deleteMenu };
