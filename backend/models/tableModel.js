const { getPool, sql } = require('../config/db');

async function getTables() {
  const pool = await getPool();
  const result = await pool.request()
    .query('SELECT * FROM RestaurantTables ORDER BY TableNumber');
  return result.recordset;
}

async function addTable(tableNumber, seats) {
  const pool = await getPool();
  await pool.request()
    .input('tableNumber', sql.NVarChar, tableNumber)
    .input('seats', sql.Int, seats)
    .query('INSERT INTO RestaurantTables (TableNumber, Seats) VALUES (@tableNumber,@seats)');
}

async function updateTable(id, tableNumber, seats) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .input('tableNumber', sql.NVarChar, tableNumber)
    .input('seats', sql.Int, seats)
    .query('UPDATE RestaurantTables SET TableNumber=@tableNumber, Seats=@seats, UpdatedAt=GETDATE() WHERE Id=@id');
}

async function deleteTable(id) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM RestaurantTables WHERE Id=@id');
}

module.exports = { getTables, addTable, updateTable, deleteTable };
