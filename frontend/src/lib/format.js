export const formatDate = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  d ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', ...opts }).format(new Date(d)) : '';

export const shortDate = (d) => formatDate(d, { day: 'numeric', month: 'short', year: 'numeric' });

export const compact = (n = 0) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export const timeAgo = (d) => {
  const s = Math.round((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  const units = [[31536000, 'year'], [2592000, 'month'], [604800, 'week'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
  for (const [sec, name] of units) {
    const v = Math.floor(s / sec);
    if (v >= 1) return `${v} ${name}${v > 1 ? 's' : ''} ago`;
  }
  return '';
};

/** First sentence of a passage, used as the hero's opening line. */
export const openingLine = (text = '', max = 170) => {
  const m = text.match(/^(.{20,}?[.!?…”"])(\s|$)/);
  const line = (m ? m[1] : text).trim();
  return line.length > max ? line.slice(0, line.lastIndexOf(' ', max)) + '…' : line;
};

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '•';
