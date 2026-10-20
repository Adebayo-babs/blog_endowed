const mongoose = require('mongoose');

// One document per post per day. Keeps the analytics chart cheap to query.
const dailyStatSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  day: { type: String, required: true }, // YYYY-MM-DD (Africa/Lagos)
  views: { type: Number, default: 0 },
});

dailyStatSchema.index({ post: 1, day: 1 }, { unique: true });
dailyStatSchema.index({ day: 1 });

module.exports = mongoose.model('DailyStat', dailyStatSchema);
