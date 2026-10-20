const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { sign, requireAuth } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: { message: 'Too many attempts. Wait a few minutes and try again.' } });

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

router.post('/register', limiter, async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name?.trim() || !emailOk(email)) return res.status(400).json({ message: 'Enter your name and a valid email.' });
  if (!password || password.length < 8) return res.status(400).json({ message: 'Use a password with at least 8 characters.' });
  if (await User.exists({ email: email.toLowerCase() })) {
    return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });
  }
  const user = await User.create({ name: name.trim(), email, password, role: 'reader' });
  res.status(201).json({ token: sign(user), user: user.toPublic() });
});

router.post('/login', limiter, async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || ''))) {
    return res.status(401).json({ message: 'That email and password don’t match.' });
  }
  res.json({ token: sign(user), user: user.toPublic() });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user.toPublic() }));

router.put('/me', requireAuth, async (req, res) => {
  const { name, avatar } = req.body || {};
  if (name?.trim()) req.user.name = name.trim();
  if (typeof avatar === 'string') req.user.avatar = avatar;
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});

router.put('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword || ''))) {
    return res.status(400).json({ message: 'Your current password is incorrect.' });
  }
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Use at least 8 characters.' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated.' });
});

module.exports = router;
