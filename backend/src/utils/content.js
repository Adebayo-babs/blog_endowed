const sanitizeHtml = require('sanitize-html');
const slugifyLib = require('slugify');

const ALLOWED = {
  allowedTags: [
    'h2', 'h3', 'h4', 'p', 'br', 'hr', 'blockquote', 'strong', 'b', 'em', 'i', 'u', 's', 'mark',
    'a', 'ul', 'ol', 'li', 'code', 'pre', 'img', 'figure', 'figcaption', 'span', 'iframe',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    iframe: ['src', 'width', 'height', 'allowfullscreen', 'frameborder', 'allow'],
    p: ['style'], h2: ['style'], h3: ['style'], h4: ['style'],
    mark: ['data-color'], span: ['class'], code: ['class'],
  },
  allowedStyles: { '*': { 'text-align': [/^(left|right|center|justify)$/] } },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com', 'open.spotify.com'],
  transformTags: {
    a: (tag, attribs) => ({
      tagName: 'a',
      attribs: /^https?:/.test(attribs.href || '')
        ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' }
        : attribs,
    }),
  },
};

const clean = (html = '') => sanitizeHtml(html, ALLOWED);

const toPlainText = (html = '') =>
  sanitizeHtml(html.replace(/<\/(p|h[1-6]|li|blockquote|figcaption)>|<br\s*\/?>/gi, '$& '), { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// ~220 words per minute is typical for leisure reading on a phone.
const readingTime = (text = '') => Math.max(1, Math.round(text.split(' ').filter(Boolean).length / 220));

const makeExcerpt = (text = '', len = 220) =>
  text.length <= len ? text : text.slice(0, text.lastIndexOf(' ', len)) + '…';

const slugify = (s) => slugifyLib(s, { lower: true, strict: true, trim: true }).slice(0, 90) || 'post';

// Calendar day in the writer's time zone (Missouri), used to group daily reads
const siteDay = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: process.env.SITE_TIMEZONE || 'America/Chicago' }).format(date);

module.exports = { clean, toPlainText, readingTime, makeExcerpt, slugify, siteDay };
