const router = require('express').Router();
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 60 * 1000, limit: 6, message: { message: 'You are commenting too fast. Wait a minute.' } });

const syncCount = async (postId) => {
  const n = await Comment.countDocuments({ post: postId, hidden: false });
  await Post.updateOne({ _id: postId }, { commentsCount: n });
};

router.get('/post/:postId', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.postId)) return res.json({ comments: [] });
  const comments = await Comment.find({ post: req.params.postId, hidden: false })
    .sort({ createdAt: 1 }).populate('user', 'name avatar role').lean();
  res.json({ comments });
});

router.post('/post/:postId', requireAuth, limiter, async (req, res) => {
  const body = (req.body?.body || '').trim();
  if (!body) return res.status(400).json({ message: 'Write something before posting.' });
  if (body.length > 2000) return res.status(400).json({ message: 'Keep comments under 2,000 characters.' });
  const post = await Post.findOne({ _id: req.params.postId, status: 'published' }).select('_id');
  if (!post) return res.status(404).json({ message: 'Story not found' });

  let parent = null;
  if (req.body.parent && mongoose.isValidObjectId(req.body.parent)) {
    const p = await Comment.findOne({ _id: req.body.parent, post: post._id });
    if (p) parent = p.parent || p._id; // keep threads one level deep
  }
  const comment = await Comment.create({ post: post._id, user: req.user._id, body, parent });
  await syncCount(post._id);
  await comment.populate('user', 'name avatar role');
  res.status(201).json({ comment });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Comment not found' });
  if (!c.user.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'You can only delete your own comments.' });
  }
  await Comment.deleteMany({ $or: [{ _id: c._id }, { parent: c._id }] });
  await syncCount(c.post);
  res.json({ message: 'Comment deleted.' });
});

module.exports = router;
