const { getPool } = require('../config/db'); // your mssql pool

// Create a new order
async function create(orderData) {
    const pool = await getPool();
    const result = await pool.request()
        .input('TableId', orderData.TableId)
        .input('WaiterId', orderData.WaiterId)
        .input('Items', JSON.stringify(orderData.Items)) // store as JSON
        .input('Total', orderData.Total)
        .input('Status', orderData.Status || 'pending')
        .query(`
            INSERT INTO Orders (TableId, WaiterId, Items, Total, Status)
            OUTPUT INSERTED.*
            VALUES (@TableId, @WaiterId, @Items, @Total, @Status)
        `);
    return result.recordset[0];
}

// Get all pending orders
async function getPending() {
    const pool = await getPool();
    const result = await pool.request()
        .query("SELECT * FROM Orders WHERE Status='pending' ORDER BY Id DESC");
    return result.recordset;
}

// Get order by Id
async function getById(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('Id', id)
        .query('SELECT * FROM Orders WHERE Id = @Id');
    return result.recordset[0];
}

// Full update (if needed, e.g., for editing items or total)
async function update(id, data) {
    const pool = await getPool();
    const result = await pool.request()
        .input('Id', id)
        .input('Items', JSON.stringify(data.Items || []))
        .input('Total', data.Total ?? 0)
        .input('Status', data.Status ?? 'pending')
        .query(`
            UPDATE Orders 
            SET Items=@Items, Total=@Total, Status=@Status, UpdatedAt=GETDATE()
            OUTPUT INSERTED.*
            WHERE Id=@Id
        `);
    return result.recordset[0];
}

// Update only status (mark paid or cancel)
async function updateStatus(id, status) {
    const pool = await getPool();
    const result = await pool.request()
        .input('Id', id)
        .input('Status', status)
        .query(`
            UPDATE Orders
            SET Status=@Status, UpdatedAt=GETDATE()
            OUTPUT INSERTED.*
            WHERE Id=@Id
        `);
    return result.recordset[0];
}

// Delete order
async function deleteOrder(id) {
    const pool = await getPool();
    await pool.request()
        .input('Id', id)
        .query('DELETE FROM Orders WHERE Id=@Id');
    return { id };
}



module.exports = { create, getPending, getById, update, updateStatus, deleteOrder };
