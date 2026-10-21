require('dotenv').config();
const User = require('./models/User');
const Category = require('./models/Category');
const Settings = require('./models/Settings');

const DEFAULT_TOPICS = [
  { name: 'Teaching Strategies', slug: 'teaching-strategies', color: '#3B2A86', description: 'Classroom-tested ideas for teaching writing.' },
  { name: 'Writing Resources', slug: 'writing-resources', color: '#B9781B', description: 'Guides, prompts and tools for writers and their students.' },
  { name: 'Reflections', slug: 'reflections', color: '#C2456A', description: 'Thinking out loud about how we write, teach and communicate.' },
  { name: 'Graduate Life', slug: 'graduate-life', color: '#2F7A6B', description: 'Notes from the MA in Writing journey.' },
  { name: 'Personal Development', slug: 'personal-development', color: '#4A5BA8', description: 'Growing as a writer, teacher and person.' },
];

const OLD_SITE_NAME = 'Endowed Writes';
const OLD_TOPIC_SLUGS = ['faith', 'purpose', 'relationships', 'campus-life', 'career'];

// One-time update of the stored site details to The Endowed Academy brand.
// Only replaces values that are still the old defaults, so anything edited in Settings is kept.
async function applyBrandUpdate() {
  const s = await Settings.findOne({ key: 'site' });
  if (!s || (s.brandVersion || 1) >= 2) return;
  if (!s.siteName || s.siteName === OLD_SITE_NAME) s.siteName = 'The Endowed Academy';
  if (!s.tagline || /faith, purpose and becoming/i.test(s.tagline)) s.tagline = 'Practical ideas for thinking, writing, and teaching with intention.';
  if (!s.authorBio || /first year at university/i.test(s.authorBio)) {
    s.authorBio = 'Graduate student pursuing an MA in Writing at Missouri State University. I share teaching strategies, writing resources and reflections on how we write, teach and communicate.';
  }
  s.authorName = 'Esther';

  // Swap the old starter topics for the new ones. A topic that already has posts is kept.
  const Post = require('./models/Post');
  for (const slug of OLD_TOPIC_SLUGS) {
    const cat = await Category.findOne({ slug });
    if (cat && !(await Post.exists({ category: cat._id }))) await Category.deleteOne({ _id: cat._id });
  }
  for (const t of DEFAULT_TOPICS) {
    if (!(await Category.exists({ slug: t.slug }))) await Category.create(t);
  }

  s.brandVersion = 2;
  await s.save();
  console.log('Site details updated to The Endowed Academy');
}

// Creates the single admin account from env on first start. Safe to run every boot.
async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!(await Settings.exists({ key: 'site' }))) {
    await Settings.create({ key: 'site', brandVersion: 2 });
  }
  await applyBrandUpdate();
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
