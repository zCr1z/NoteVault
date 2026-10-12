const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'cognifyz_jwt_secret_2024';

// Protect page routes via session
const requireAuth = (req, res, next) => {
  if (req.session.user) return next();
  req.flash('error', 'Please log in to access this page');
  res.redirect('/auth/login');
};

// Protect API routes via JWT (Task 6: authorization checks)
const requireJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.session.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { requireAuth, requireJWT, JWT_SECRET };
