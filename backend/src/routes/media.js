const router = require('express').Router();
const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const { getBucket } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    /^image\/(jpe?g|png|webp|gif|avif|heic|heif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Upload a JPG, PNG, WebP or GIF image.')),
});

const publicBase = (req) => process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`;

// Images are resized and converted to WebP, then stored in MongoDB (GridFS),
// so they survive restarts on hosts with temporary disks such as Render.
router.post('/', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose an image to upload.' });
  const isGif = req.file.mimetype === 'image/gif';
  const buffer = isGif
    ? req.file.buffer
    : await sharp(req.file.buffer).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const contentType = isGif ? 'image/gif' : 'image/webp';

  const id = await new Promise((resolve, reject) => {
    const stream = getBucket().openUploadStream(req.file.originalname, {
      metadata: { contentType, uploadedBy: req.user._id },
    });
    stream.on('error', reject).on('finish', () => resolve(stream.id));
    stream.end(buffer);
  });
  res.status(201).json({ id, url: `${publicBase(req)}/api/media/${id}` });
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
  const _id = new mongoose.Types.ObjectId(req.params.id);
  const [file] = await getBucket().find({ _id }).toArray();
  if (!file) return res.status(404).end();
  res.set({
    'Content-Type': file.metadata?.contentType || 'application/octet-stream',
    'Content-Length': file.length,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  getBucket().openDownloadStream(_id).pipe(res);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
  await getBucket().delete(new mongoose.Types.ObjectId(req.params.id)).catch(() => {});
  res.json({ message: 'Image deleted.' });
});

module.exports = router;
