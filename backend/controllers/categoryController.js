const categoryModel = require('../models/categoryModel');

async function getCategories(req, res) {
    try {
        const categories = await categoryModel.getAllCategories();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addCategory(req, res) {
    try {
        const { name } = req.body;
        if(!name) return res.status(400).json({ message: 'Category name required' });
        await categoryModel.addCategory(name);
        res.json({ message: 'Category added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateCategory(req, res) {
    try {
        const { id, name } = req.body;
        if(!id || !name) return res.status(400).json({ message: 'Id and name required' });
        await categoryModel.updateCategory(id, name);
        res.json({ message: 'Category updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        if(!id) return res.status(400).json({ message: 'Id required' });
        await categoryModel.deleteCategory(id);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getCategories, addCategory, updateCategory, deleteCategory };
