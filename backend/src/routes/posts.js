const router = require('express').Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');
const User = require('../models/User');
const DailyStat = require('../models/DailyStat');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { siteDay } = require('../utils/content');

const LIST_FIELDS = 'title slug excerpt coverImage coverAlt category tags readingTime views likesCount commentsCount publishedAt featured';
const published = () => ({ status: 'published', publishedAt: { $lte: new Date() } });

// GET /api/posts  ?page ?limit ?category ?tag ?q ?sort=latest|popular|oldest
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(30, Math.max(1, parseInt(req.query.limit) || 9));
  const filter = { ...published() };
  let sort = { publishedAt: -1 };
  let projection = {};

  if (req.query.category) {
    const cat = await Category.findOne({ slug: req.query.category });
    if (!cat) return res.json({ posts: [], total: 0, page, pages: 0 });
    filter.category = cat._id;
  }
  if (req.query.tag) filter.tags = req.query.tag.toLowerCase();
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.q?.trim()) {
    filter.$text = { $search: req.query.q.trim().slice(0, 100) };
    projection = { score: { $meta: 'textScore' } };
    sort = { score: { $meta: 'textScore' } };
  }
  if (req.query.sort === 'popular') sort = { views: -1, likesCount: -1 };
  if (req.query.sort === 'oldest') sort = { publishedAt: 1 };

  const run = (f, proj, srt) => Promise.all([
    Post.find(f, proj).select(LIST_FIELDS).sort(srt).skip((page - 1) * limit).limit(limit)
      .populate('category', 'name slug color').lean(),
    Post.countDocuments(f),
  ]);

  let posts, total;
  try {
    [posts, total] = await run(filter, projection, sort);
  } catch (err) {
    if (!filter.$text) throw err;
    // Fallback while the text index is still building (or on databases without one)
    const rx = new RegExp(req.query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const { $text, ...rest } = filter;
    [posts, total] = await run({ ...rest, $or: [{ title: rx }, { excerpt: rx }, { tags: rx }] }, {}, { publishedAt: -1 });
  }
  res.json({ posts, total, page, pages: Math.ceil(total / limit) });
});

router.get('/popular', async (req, res) => {
  const limit = Math.min(10, parseInt(req.query.limit) || 5);
  const posts = await Post.find(published()).select(LIST_FIELDS).sort({ views: -1 }).limit(limit)
    .populate('category', 'name slug color').lean();
  res.json({ posts });
});

router.get('/tags', async (_req, res) => {
  const tags = await Post.aggregate([
    { $match: published() }, { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 60 },
  ]);
  res.json({ tags: tags.map((t) => ({ name: t._id, count: t.count })) });
});

// Used by the sitemap
router.get('/slugs', async (_req, res) => {
  const posts = await Post.find(published()).select('slug updatedAt').lean();
  res.json({ posts });
});

router.get('/:slug', optionalAuth, async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, ...published() })
    .populate('category', 'name slug color description').lean();
  if (!post) return res.status(404).json({ message: 'This story could not be found.' });

  let liked = false, bookmarked = false;
  if (req.user) {
    liked = !!(await Post.exists({ _id: post._id, likes: req.user._id }));
    bookmarked = req.user.bookmarks.some((b) => b.equals(post._id));
  }

  const [related, prev, next] = await Promise.all([
    Post.find({ ...published(), _id: { $ne: post._id },
      $or: [{ category: post.category?._id }, { tags: { $in: post.tags } }] })
      .select(LIST_FIELDS).sort({ publishedAt: -1 }).limit(3).populate('category', 'name slug color').lean(),
    Post.findOne({ ...published(), publishedAt: { $lt: post.publishedAt } }).sort({ publishedAt: -1 }).select('title slug').lean(),
    Post.findOne({ status: 'published', publishedAt: { $gt: post.publishedAt, $lte: new Date() } }).sort({ publishedAt: 1 }).select('title slug').lean(),
  ]);

  res.json({ post, liked, bookmarked, related, prev, next });
});

router.post('/:slug/view', async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'published' }).select('_id views').lean();
  if (!post) return res.status(404).json({ message: 'Not found' });
  await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });
  post.views += 1;
  await DailyStat.updateOne({ post: post._id, day: siteDay() }, { $inc: { views: 1 } }, { upsert: true });
  res.json({ views: post.views });
});

router.post('/:id/like', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid post' });
  const already = await Post.exists({ _id: req.params.id, likes: req.user._id });
  const update = already
    ? { $pull: { likes: req.user._id }, $inc: { likesCount: -1 } }
    : { $addToSet: { likes: req.user._id }, $inc: { likesCount: 1 } };
  const result = await Post.updateOne({ _id: req.params.id, status: 'published' }, update);
  if (!result.matchedCount) return res.status(404).json({ message: 'Not found' });
  const post = await Post.findById(req.params.id).select('likesCount').lean();
  res.json({ liked: !already, likesCount: post.likesCount });
});

router.post('/:id/bookmark', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid post' });
  const has = req.user.bookmarks.some((b) => b.equals(req.params.id));
  await User.updateOne({ _id: req.user._id }, has
    ? { $pull: { bookmarks: req.params.id } }
    : { $addToSet: { bookmarks: req.params.id } });
  res.json({ bookmarked: !has });
});

module.exports = router;
