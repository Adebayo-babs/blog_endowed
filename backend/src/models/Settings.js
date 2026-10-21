const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    siteName: { type: String, default: 'The Endowed Academy' },
    tagline: { type: String, default: 'Practical ideas for thinking, writing, and teaching with intention.' },
    authorName: { type: String, default: 'Esther' },
    authorBio: { type: String, default: 'Graduate student pursuing an MA in Writing at Missouri State University. I share teaching strategies, writing resources and reflections on how we write, teach and communicate.' },
    authorAvatar: { type: String, default: '' },
    aboutContent: { type: String, default: '' },
    // Home page "meet the writer" section. Empty photos fall back to the photos bundled with the site.
    homeHeading: { type: String, default: '' },
    homeIntro: { type: String, default: '' },
    homePhotos: { type: [String], default: [] },
    // No default on purpose: older saved settings must read as version 1 so the brand update runs once
    brandVersion: { type: Number },
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
  if (!doc) doc = await this.create({ key: 'site', brandVersion: 2 });
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
