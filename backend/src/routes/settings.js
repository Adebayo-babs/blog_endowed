const router = require('express').Router();
const Settings = require('../models/Settings');

router.get('/', async (_req, res) => {
  const s = await Settings.get();
  res.json({ settings: s });
});

module.exports = router;
