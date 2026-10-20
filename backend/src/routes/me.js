const router = require('express').Router();
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');

router.get('/bookmarks', requireAuth, async (req, res) => {
  const posts = await Post.find({ _id: { $in: req.user.bookmarks }, status: 'published' })
    .select('title slug excerpt coverImage category readingTime publishedAt likesCount')
    .populate('category', 'name slug color').lean();
  // keep most recently saved first
  const order = req.user.bookmarks.map(String).reverse();
  posts.sort((a, b) => order.indexOf(String(a._id)) - order.indexOf(String(b._id)));
  res.json({ posts });
});

module.exports = router;
