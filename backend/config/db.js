require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 1433,
  options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
};

let pool;

async function getPool() {
  if (pool) return pool;
  try {
    pool = await sql.connect(config);
    console.log('Connected to MSSQL');
    return pool;
  } catch (err) {
    console.error('MSSQL Connection Error: ', err);
    throw err;
  }
}

module.exports = { sql, getPool };
