require('dotenv').config();
const User = require('./models/User');
const Category = require('./models/Category');
const Settings = require('./models/Settings');

const DEFAULT_TOPICS = [
  { name: 'Faith', slug: 'faith', color: '#3B2A86', description: 'Walking with God through ordinary days.' },
  { name: 'Purpose', slug: 'purpose', color: '#B9781B', description: 'Finding out what you were made for.' },
  { name: 'Relationships', slug: 'relationships', color: '#C2456A', description: 'Friendship, love and boundaries, honestly.' },
  { name: 'Campus Life', slug: 'campus-life', color: '#2F7A6B', description: 'Lectures, exams, money and everything between.' },
  { name: 'Career', slug: 'career', color: '#4A5BA8', description: 'From final year to first job.' },
];

// Creates the single admin account from env on first start. Safe to run every boot.
async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!(await Settings.exists({ key: 'site' }))) {
    await Settings.create({ key: 'site', authorName: process.env.ADMIN_NAME || 'The Writer' });
  }
  if (!(await Category.estimatedDocumentCount())) await Category.insertMany(DEFAULT_TOPICS);
  if (!email || !password) return;
  if (await User.exists({ role: 'admin' })) return;
  await User.create({ name: process.env.ADMIN_NAME || 'Admin', email, password, role: 'admin' });
  console.log(`Admin account created for ${email}`);
}

if (require.main === module) {
  const { connectDB } = require('./config/db');
  connectDB(process.env.MONGODB_URI).then(ensureAdmin).then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { ensureAdmin };
