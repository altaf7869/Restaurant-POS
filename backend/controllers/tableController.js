const tableModel = require('../models/tableModel');

async function getTables(req, res) {
    try {
        const tables = await tableModel.getTables();
        res.json(tables);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function addTable(req, res) {
    try {
        const { tableNumber, seats } = req.body;
        if(!tableNumber || !seats) return res.status(400).json({ message: 'Table number and seats required' });

        await tableModel.addTable(tableNumber, seats);

        // Emit Socket.io event
        const io = req.app.get('io');
        io.emit('tableAdded', { tableNumber, seats });

        res.json({ message: 'Table added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateTable(req, res) {
    try {
        const { id, tableNumber, seats } = req.body;
        if(!id || !tableNumber || !seats) return res.status(400).json({ message: 'Id, table number and seats required' });

        await tableModel.updateTable(id, tableNumber, seats);

        const io = req.app.get('io');
        io.emit('tableUpdated', { id, tableNumber, seats });

        res.json({ message: 'Table updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteTable(req, res) {
    try {
        const { id } = req.params;
        if(!id) return res.status(400).json({ message: 'Id required' });

        await tableModel.deleteTable(id);

        const io = req.app.get('io');
        io.emit('tableDeleted', { id });

        res.json({ message: 'Table deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getTables, addTable, updateTable, deleteTable };
