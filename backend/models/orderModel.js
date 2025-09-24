const { getPool } = require('../config/db'); // MSSQL pool

/**
 * Create a new order
 * @param {Object} orderData
 * @returns {Promise<Object>} created order
 */
async function create(orderData) {
  const pool = await getPool();
  const result = await pool.request()
    .input('TableId', orderData.TableId)
    .input('WaiterId', orderData.WaiterId)
    .input('Items', JSON.stringify(orderData.Items || []))
    .input('Total', orderData.Total ?? 0)
    .input('Status', orderData.Status || 'pending')
    .query(`
      INSERT INTO Orders (TableId, WaiterId, Items, Total, Status)
      OUTPUT INSERTED.*
      VALUES (@TableId, @WaiterId, @Items, @Total, @Status)
    `);

  const order = result.recordset[0];
  order.Items = Array.isArray(order.Items) ? order.Items : [];
  return order;
}

/**
 * Get all pending orders
 */
async function getPending() {
  const pool = await getPool();
  const result = await pool.request()
    .query("SELECT * FROM Orders WHERE Status='pending' ORDER BY Id DESC");

  return result.recordset.map(order => ({
    ...order,
    Items: order.Items ? JSON.parse(order.Items) : []
  }));
}

/**
 * Get order by Id
 */
async function getById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('Id', id)
    .query('SELECT * FROM Orders WHERE Id = @Id');

  const order = result.recordset[0];
  if (!order) return null;

  order.Items = order.Items ? JSON.parse(order.Items) : [];
  return order;
}

/**
 * Get all orders
 */
async function fetchAllOrders() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT * FROM Orders ORDER BY UpdatedAt DESC
  `);

  return result.recordset.map(order => ({
    ...order,
    Items: order.Items ? JSON.parse(order.Items) : []
  }));
}

/**
 * Update order fully (items, totals, discount, status)
 */
async function update(id, data) {
  const pool = await getPool();
  const result = await pool.request()
    .input('Id', id)
    .input('Items', JSON.stringify(data.Items || []))
    .input('Total', data.Total ?? 0)
    .input('DiscountPercent', data.DiscountPercent ?? 0)
    .input('DiscountAmount', data.DiscountAmount ?? 0)
    .input('Status', data.Status || 'pending')
    .query(`
      UPDATE Orders 
      SET Items=@Items, Total=@Total, 
          DiscountPercent=@DiscountPercent, 
          DiscountAmount=@DiscountAmount, 
          Status=@Status, UpdatedAt=GETDATE()
      OUTPUT INSERTED.*
      WHERE Id=@Id
    `);

  const updated = result.recordset[0];
  updated.Items = updated.Items ? JSON.parse(updated.Items) : [];
  return updated;
}

/**
 * Update only order status, optionally insert payment
 */
async function updateStatus(id, status, paymentData) {
  const pool = await getPool();
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const orderResult = await transaction.request()
      .input('Id', id)
      .input('Status', status)
      .query(`
        UPDATE Orders
        SET Status=@Status, UpdatedAt=GETDATE()
        OUTPUT INSERTED.*
        WHERE Id=@Id
      `);

    const updatedOrder = orderResult.recordset[0];

    if (paymentData) {
      await transaction.request()
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

    updatedOrder.Items = updatedOrder.Items ? JSON.parse(updatedOrder.Items) : [];
    return updatedOrder;

  } catch (err) {
    await transaction.rollback();
    console.error("Transaction Error:", err);
    throw err;
  }
}

/**
 * Find the latest pending order by table
 */
async function findOrderByTable(tableId) {
  const pool = await getPool();
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
  order.Items = order.Items ? JSON.parse(order.Items) : [];
  return order;
}

// GET Popular items daily basis
async function getPopularItems(fromDate, toDate, top = 10) {
  let query = `
    SELECT TOP (${top})
      oi.MenuItemId,
      m.Name,
      SUM(oi.Qty) AS TotalQty,
      SUM(oi.Qty * oi.Price) AS TotalSales
    FROM OrderItems oi
    INNER JOIN Orders o ON oi.OrderId = o.Id
    INNER JOIN Menu m ON oi.MenuItemId = m.Id
    WHERE o.Status IN ('pending', 'paid')
  `;

  if (fromDate && toDate) {
    query += ` AND o.CreatedAt BETWEEN @fromDate AND @toDate`;
  }

  query += ` GROUP BY oi.MenuItemId, m.Name
             ORDER BY TotalQty DESC`;

  const request = new sql.Request();
  if (fromDate && toDate) {
    request.input('fromDate', sql.DateTime, fromDate);
    request.input('toDate', sql.DateTime, toDate);
  }

  const result = await request.query(query);
  return result.recordset;
}

/**
 * Delete an order
 */
async function deleteOrder(id) {
  const pool = await getPool();
  await pool.request()
    .input('Id', id)
    .query('DELETE FROM Orders WHERE Id=@Id');

  return { id };
}

module.exports = {
  create,
  getPending,
  getById,
  fetchAllOrders,
  update,
  updateStatus,
  findOrderByTable,
  deleteOrder,
  getPopularItems
};
