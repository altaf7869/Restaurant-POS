const { getPool, sql } = require('../config/db');

async function getAllCategories() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Categories ORDER BY Name');
  return result.recordset;
}

async function addCategory(name) {
  const pool = await getPool();
  await pool.request()
    .input('name', sql.NVarChar, name)
    .query('INSERT INTO Categories (Name) VALUES (@name)');
}

async function updateCategory(id, name) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .input('name', sql.NVarChar, name)
    .query('UPDATE Categories SET Name=@name, UpdatedAt=GETDATE() WHERE Id=@id');
}

async function deleteCategory(id) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM Categories WHERE Id=@id');
}

module.exports = { getAllCategories, addCategory, updateCategory, deleteCategory };
