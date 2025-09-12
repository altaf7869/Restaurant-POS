const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcryptjs');

async function getUserByUsername(username) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE Username = @username AND IsActive = 1');
    return result.recordset[0];
}

async function createUser(user) {
    const pool = await poolPromise;
    const hash = await bcrypt.hash(user.password, 10);
    await pool.request()
      .input('username', sql.NVarChar, user.username)
      .input('passwordHash', sql.NVarChar, hash)
      .input('fullName', sql.NVarChar, user.fullName)
      .input('role', sql.NVarChar, user.role)
      .query('INSERT INTO Users (Username, PasswordHash, FullName, Role) VALUES (@username, @passwordHash, @fullName, @role)');
}

module.exports = { getUserByUsername, createUser };
