const { getPool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// ------------------ Register new user ------------------
async function registerUser(req, res) {
  const { username, password, fullName, role } = req.body;
  if (!username || !password || !fullName || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const pool = await getPool();

    // Check if username already exists
    const existing = await pool.request()
      .input('username', username)
      .query('SELECT * FROM Users WHERE Username = @username');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    await pool.request()
      .input('username', username)
      .input('password', hashedPassword)
      .input('fullName', fullName)
      .input('role', role)
      .input('isActive', 1) // default active
      .query(`
        INSERT INTO Users (Username, PasswordHash, FullName, Role, IsActive, CreatedAt)
        VALUES (@username, @password, @fullName, @role, @isActive, GETDATE())
      `);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ------------------ Login user ------------------
async function loginUser(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const pool = await getPool();

    // Fetch user by username and active status
    const result = await pool.request()
      .input('username', username)
      .query('SELECT * FROM Users WHERE Username = @username AND IsActive = 1');

    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials or inactive user' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign(
      { id: user.Id, username: user.Username, role: user.Role },
      SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, username: user.Username, role: user.Role });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { registerUser, loginUser };
