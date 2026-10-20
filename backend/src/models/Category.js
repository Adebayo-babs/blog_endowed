const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '', maxlength: 300 },
    color: { type: String, default: '#3B2A86' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
