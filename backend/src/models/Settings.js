const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    siteName: { type: String, default: 'Endowed Writes' },
    tagline: { type: String, default: 'Honest stories on faith, purpose and becoming, for anyone finding their way through campus and beyond.' },
    authorName: { type: String, default: 'The Writer' },
    authorBio: { type: String, default: 'I write the letters I wish someone had written to me in my first year at university.' },
    authorAvatar: { type: String, default: '' },
    aboutContent: { type: String, default: '' },
    socials: {
      instagram: { type: String, default: '' },
      x: { type: String, default: '' },
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      email: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.get = async function () {
  let doc = await this.findOne({ key: 'site' });
  if (!doc) doc = await this.create({ key: 'site' });
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
