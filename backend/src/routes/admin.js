const router = require('express').Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const User = require('../models/User');
const DailyStat = require('../models/DailyStat');
const Settings = require('../models/Settings');
const { requireAdmin } = require('../middleware/auth');
const { clean, toPlainText, readingTime, makeExcerpt, slugify, lagosDay } = require('../utils/content');

router.use(requireAdmin);

/* ---------- Dashboard analytics ---------- */
router.get('/stats', async (req, res) => {
  const days = Math.min(90, Math.max(7, parseInt(req.query.days) || 30));
  const dayList = [...Array(days)].map((_, i) => lagosDay(new Date(Date.now() - (days - 1 - i) * 864e5)));

  const [totals, daily, topPosts, readers, comments, drafts, recentComments, prevPeriod] = await Promise.all([
    Post.find({ status: 'published' }).select('views likesCount').lean(),
    DailyStat.aggregate([{ $match: { day: { $gte: dayList[0] } } }, { $group: { _id: '$day', views: { $sum: '$views' } } }]),
    Post.find({ status: 'published' }).sort({ views: -1 }).limit(6)
      .select('title slug views likesCount commentsCount publishedAt').lean(),
    User.countDocuments({ role: 'reader' }),
    Comment.countDocuments({ hidden: false }),
    Post.countDocuments({ status: 'draft' }),
    Comment.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').populate('post', 'title slug').lean(),
    DailyStat.aggregate([{ $match: { day: { $gte: lagosDay(new Date(Date.now() - (days * 2 - 1) * 864e5)), $lt: dayList[0] } } },
      { $group: { _id: null, views: { $sum: '$views' } } }]),
  ]);

  const byDay = Object.fromEntries(daily.map((d) => [d._id, d.views]));
  const series = dayList.map((day) => ({ day, views: byDay[day] || 0 }));
  const periodViews = series.reduce((s, d) => s + d.views, 0);

  res.json({
    totals: {
      posts: totals.length,
      views: totals.reduce((n, p) => n + (p.views || 0), 0),
      likes: totals.reduce((n, p) => n + (p.likesCount || 0), 0),
      readers, comments, drafts,
    },
    period: { days, views: periodViews, previous: prevPeriod[0]?.views || 0 },
    series, topPosts, recentComments,
  });
});

/* ---------- Posts ---------- */
router.get('/posts', async (req, res) => {
  const filter = {};
  if (['draft', 'published'].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.q) filter.title = { $regex: req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const posts = await Post.find(filter).sort({ updatedAt: -1 })
    .select('title slug status featured views likesCount commentsCount publishedAt updatedAt coverImage')
    .populate('category', 'name').lean();
  res.json({ posts });
});

router.get('/posts/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Not found' });
  const post = await Post.findById(req.params.id).lean();
  if (!post) return res.status(404).json({ message: 'Not found' });
  res.json({ post });
});

async function uniqueSlug(base, ignoreId) {
  let slug = slugify(base), n = 1;
  while (await Post.exists({ slug, ...(ignoreId && { _id: { $ne: ignoreId } }) })) slug = `${slugify(base)}-${++n}`;
  return slug;
}

function buildPost(body) {
  const content = clean(body.content || '');
  const plainText = toPlainText(content);
  const tags = (Array.isArray(body.tags) ? body.tags : String(body.tags || '').split(','))
    .map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 12);
  return {
    title: (body.title || '').trim(),
    content, plainText,
    excerpt: (body.excerpt || '').trim() || makeExcerpt(plainText),
    readingTime: readingTime(plainText),
    coverImage: body.coverImage || '',
    coverAlt: body.coverAlt || '',
    category: mongoose.isValidObjectId(body.category) ? body.category : undefined,
    tags,
    featured: !!body.featured,
    status: body.status === 'published' ? 'published' : 'draft',
    seoTitle: body.seoTitle || '',
    seoDescription: body.seoDescription || '',
  };
}

router.post('/posts', async (req, res) => {
  const data = buildPost(req.body || {});
  if (!data.title) return res.status(400).json({ message: 'Give the story a title.' });
  data.slug = await uniqueSlug(req.body.slug || data.title);
  if (data.status === 'published') data.publishedAt = req.body.publishedAt ? new Date(req.body.publishedAt) : new Date();
  if (data.featured) await Post.updateMany({}, { featured: false });
  const post = await Post.create(data);
  res.status(201).json({ post });
});

router.put('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found' });
  const data = buildPost(req.body || {});
  if (!data.title) return res.status(400).json({ message: 'Give the story a title.' });
  if (req.body.slug && slugify(req.body.slug) !== post.slug) data.slug = await uniqueSlug(req.body.slug, post._id);
  if (data.status === 'published') {
    data.publishedAt = req.body.publishedAt ? new Date(req.body.publishedAt) : post.publishedAt || new Date();
  }
  if (data.featured && !post.featured) await Post.updateMany({ _id: { $ne: post._id } }, { featured: false });
  if (!data.category) delete data.category;
  Object.assign(post, data);
  if (!req.body.category) post.category = undefined;
  await post.save();
  res.json({ post });
});

router.delete('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).select('_id').lean();
  if (!post) return res.status(404).json({ message: 'Not found' });
  await Post.deleteOne({ _id: post._id });
  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    DailyStat.deleteMany({ post: post._id }),
    User.updateMany({}, { $pull: { bookmarks: post._id } }),
  ]);
  res.json({ message: 'Story deleted.' });
});

/* ---------- Categories ---------- */
router.post('/categories', async (req, res) => {
  const name = (req.body?.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Name the topic.' });
  const slug = slugify(name);
  if (await Category.exists({ slug })) return res.status(409).json({ message: 'That topic already exists.' });
  const category = await Category.create({ name, slug, description: req.body.description || '', color: req.body.color || '#3B2A86' });
  res.status(201).json({ category });
});

router.put('/categories/:id', async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Not found' });
  if (req.body.name?.trim()) { cat.name = req.body.name.trim(); cat.slug = slugify(cat.name); }
  if (typeof req.body.description === 'string') cat.description = req.body.description;
  if (req.body.color) cat.color = req.body.color;
  await cat.save();
  res.json({ category: cat });
});

router.delete('/categories/:id', async (req, res) => {
  await Category.deleteOne({ _id: req.params.id });
  await Post.updateMany({ category: req.params.id }, { $unset: { category: 1 } });
  res.json({ message: 'Topic deleted.' });
});

/* ---------- Comments moderation ---------- */
router.get('/comments', async (_req, res) => {
  const comments = await Comment.find().sort({ createdAt: -1 }).limit(200)
    .populate('user', 'name email').populate('post', 'title slug').lean();
  res.json({ comments });
});

router.patch('/comments/:id', async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  c.hidden = !!req.body.hidden;
  await c.save();
  const n = await Comment.countDocuments({ post: c.post, hidden: false });
  await Post.updateOne({ _id: c.post }, { commentsCount: n });
  res.json({ comment: c });
});

/* ---------- Readers ---------- */
router.get('/readers', async (_req, res) => {
  const readers = await User.find({ role: 'reader' }).sort({ createdAt: -1 }).select('name email createdAt bookmarks').lean();
  res.json({ readers: readers.map((r) => ({ ...r, bookmarks: r.bookmarks.length })) });
});

/* ---------- Site settings ---------- */
router.put('/settings', async (req, res) => {
  const s = await Settings.get();
  const fields = ['siteName', 'tagline', 'authorName', 'authorBio', 'authorAvatar', 'homeHeading', 'homeIntro'];
  if (Array.isArray(req.body.homePhotos)) {
    s.homePhotos = req.body.homePhotos.filter((u) => typeof u === 'string').slice(0, 2);
  }
  fields.forEach((f) => { if (typeof req.body[f] === 'string') s[f] = req.body[f]; });
  if (typeof req.body.aboutContent === 'string') s.aboutContent = clean(req.body.aboutContent);
  if (req.body.socials) s.socials = { ...s.socials.toObject?.() ?? s.socials, ...req.body.socials };
  await s.save();
  res.json({ settings: s });
});

module.exports = router;
