const { getPool, sql } = require('../config/db');
const bcrypt = require('bcryptjs');

async function getAllUsers() {
    const pool = await getPool();
    const result = await pool.request()
        .query('SELECT Id, Username, FullName, Role, CreatedAt FROM Users ORDER BY Username');
    return result.recordset;
}

async function addUser(username, password, fullName, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await getPool();
    await pool.request()
        .input('username', sql.NVarChar, username)
        .input('passwordHash', sql.NVarChar, hashedPassword)
        .input('fullName', sql.NVarChar, fullName)
        .input('role', sql.NVarChar, role)
        .query('INSERT INTO Users (Username, PasswordHash, FullName, Role) VALUES (@username,@passwordHash,@fullName,@role)');
}

async function updateUser(id, fullName, role) {
    const pool = await getPool();
    await pool.request()
        .input('id', sql.Int, id)
        .input('fullName', sql.NVarChar, fullName)
        .input('role', sql.NVarChar, role)
        .query('UPDATE Users SET FullName=@fullName, Role=@role, UpdatedAt=GETDATE() WHERE Id=@id');
}

async function deleteUser(id) {
    const pool = await getPool();
    await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Users WHERE Id=@id');
}

module.exports = { getAllUsers, addUser, updateUser, deleteUser };
