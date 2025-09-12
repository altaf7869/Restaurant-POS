// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  // Expect header format: Bearer <token>
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // attach user data to request
    next();
  } catch (err) {
    console.error('JWT Verify Error:', err);
    return res.status(403).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
