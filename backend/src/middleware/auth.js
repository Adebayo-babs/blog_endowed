const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

async function readUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(id);
  } catch {
    return null;
  }
}

const optionalAuth = async (req, _res, next) => {
  req.user = await readUser(req);
  next();
};

const requireAuth = async (req, res, next) => {
  req.user = await readUser(req);
  if (!req.user) return res.status(401).json({ message: 'Sign in to continue.' });
  next();
};

const requireAdmin = async (req, res, next) => {
  req.user = await readUser(req);
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only the site admin can do this.' });
  }
  next();
};

module.exports = { sign, optionalAuth, requireAuth, requireAdmin };
