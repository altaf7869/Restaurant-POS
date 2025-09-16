// models/payment.model.js
const { getPool } = require('../config/db');

async function getPymentHistory() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`
                SELECT 
        p.Id,
        p.OrderId,
        p.Amount,
        p.Method,
        p.CollectedBy,
        u.Username AS CollectedByName,
        p.CollectedAt
      FROM Payments p
      LEFT JOIN Users u ON p.CollectedBy = u.Id
            `);
  return result.recordset;
}


module.exports = { getPymentHistory};
