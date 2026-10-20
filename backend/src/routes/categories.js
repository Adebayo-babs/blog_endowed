const router = require('express').Router();
const Category = require('../models/Category');
const Post = require('../models/Post');

router.get('/', async (_req, res) => {
  const [cats, counts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Post.aggregate([{ $match: { status: 'published', publishedAt: { $lte: new Date() } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  res.json({ categories: cats.map((c) => ({ ...c, count: map[String(c._id)] || 0 })) });
});

router.get('/:slug', async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) return res.status(404).json({ message: 'Topic not found' });
  res.json({ category });
});

module.exports = router;
