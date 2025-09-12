const { getPool, sql } = require('../config/db');

async function getMenuItems() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT m.Id, m.Name, m.Description, m.Price, c.Name AS CategoryName, m.CategoryId
            FROM MenuItems m
            JOIN Categories c ON m.CategoryId = c.Id
            ORDER BY m.Name`);
  return result.recordset;
}

async function addMenuItem(name, description, price, categoryId) {
  const pool = await getPool();
  await pool.request()
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description)
    .input('price', sql.Decimal(10,2), price)
    .input('categoryId', sql.Int, categoryId)
    .query('INSERT INTO MenuItems (Name, Description, Price, CategoryId) VALUES (@name,@description,@price,@categoryId)');
}

async function updateMenuItem(id, name, description, price, categoryId) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .input('name', sql.NVarChar, name)
    .input('description', sql.NVarChar, description)
    .input('price', sql.Decimal(10,2), price)
    .input('categoryId', sql.Int, categoryId)
    .query('UPDATE MenuItems SET Name=@name, Description=@description, Price=@price, CategoryId=@categoryId, UpdatedAt=GETDATE() WHERE Id=@id');
}

async function deleteMenuItem(id) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM MenuItems WHERE Id=@id');
}

module.exports = { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem };
