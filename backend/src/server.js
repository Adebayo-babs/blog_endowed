require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { connectDB } = require('./config/db');
const { ensureAdmin } = require('./seed');

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}. See .env.example.`);
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);

const origins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((s) => s.trim().replace(/\/$/, ''));
app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server (no origin), listed origins, and Vercel preview deployments
    if (!origin || origins.includes(origin) || /\.vercel\.app$/.test(new URL(origin).hostname)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json({ limit: '4mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/me', require('./routes/me'));
app.use('/api/media', require('./routes/media'));
app.use('/api/admin', require('./routes/admin'));

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.code === 11000) return res.status(409).json({ message: 'That already exists.' });
  if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Images must be under 8 MB.' });
  }
  const status = err.status || (err.message?.startsWith('Upload a') ? 400 : 500);
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Something went wrong on the server.' : err.message });
});

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI)
  .then(ensureAdmin)
  .then(() => app.listen(PORT, () => console.log(`API listening on :${PORT}`)))
  .catch((e) => { console.error('Startup failed:', e.message); process.exit(1); });

module.exports = app;
