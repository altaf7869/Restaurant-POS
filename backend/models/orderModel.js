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

// Get All Orders
async function fetchAllOrders() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Orders ORDER BY Status ASC, UpdatedAt DESC');
  return result.recordset; // ✅ returns array of all orders
}

// Full update (if needed, e.g., for editing items or total)
async function update(id, data) {
    const pool = await getPool();
    const result = await pool.request()
        .input('Id', id)
        .input('Items', JSON.stringify(data.Items || []))
        .input('Total', data.Total ?? 0)
        .input('DiscountPercent', data.DiscountPercent ?? 0)
        .input('DiscountAmount', data.DiscountAmount ?? 0)
        .input('Status', data.Status ?? 'pending')
        .query(`
            UPDATE Orders 
            SET Items=@Items, Total=@Total, 
                DiscountPercent=@DiscountPercent, 
                DiscountAmount=@DiscountAmount, 
                Status=@Status, UpdatedAt=GETDATE()
            OUTPUT INSERTED.*
            WHERE Id=@Id
        `);
    return result.recordset[0];
}

// Update only status (mark paid or cancel)
// async function updateStatus(id, status) {
//     const pool = await getPool();
//     const result = await pool.request()
//         .input('Id', id)
//         .input('Status', status)
//         .query(`
//             UPDATE Orders
//             SET Status=@Status, UpdatedAt=GETDATE()
//             OUTPUT INSERTED.*
//             WHERE Id=@Id
//         `);
//     return result.recordset[0];
// }
async function updateStatus(id, status, paymentData) {
    const pool = await getPool();

    const transaction = pool.transaction();
    await transaction.begin();

    try {
        // 1️⃣ Update Orders table
        const orderRequest = transaction.request();
        const orderResult = await orderRequest
            .input('Id', id)
            .input('Status', status)
            .query(`
                UPDATE Orders
                SET Status=@Status, UpdatedAt=GETDATE()
                OUTPUT INSERTED.*
                WHERE Id=@Id
            `);

        const updatedOrder = orderResult.recordset[0];

        // 2️⃣ Insert into Payments table if paymentData exists
        if (paymentData) {
            const paymentRequest = transaction.request();
            await paymentRequest
                .input('OrderId', updatedOrder.Id)
                .input('Amount', paymentData.amount)
                .input('Method', paymentData.method)
                .input('CollectedBy', paymentData.collectedBy)
                .query(`
                    INSERT INTO Payments (OrderId, Amount, Method, CollectedBy)
                    VALUES (@OrderId, @Amount, @Method, @CollectedBy)
                `);
        }

        await transaction.commit();
        return updatedOrder;

    } catch (err) {
        await transaction.rollback();
        console.error("Transaction Error:", err);
        throw err;
    }
}

async function findOrderByTable(tableId) {
  const pool = await getPool();

  // Get the order first
  const result = await pool.request()
    .input('tableId', tableId)
    .query(`
      SELECT TOP 1 *
      FROM Orders
      WHERE TableId = @tableId AND Status = 'pending'
      ORDER BY CreatedAt DESC
    `);

  if (result.recordset.length === 0) return null;

  const order = result.recordset[0];

  // Parse Items JSON (if stored as string in DB)
  if (order.Items && typeof order.Items === 'string') {
    try {
      order.Items = JSON.parse(order.Items);
    } catch (err) {
      console.error('Failed to parse Items JSON for order', err);
      order.Items = [];
    }
  }

  return order;
}


// Delete order
async function deleteOrder(id) {
    const pool = await getPool();
    await pool.request()
        .input('Id', id)
        .query('DELETE FROM Orders WHERE Id=@Id');
    return { id };
}



module.exports = { create, getPending, getById, update, updateStatus, findOrderByTable, deleteOrder, fetchAllOrders };
