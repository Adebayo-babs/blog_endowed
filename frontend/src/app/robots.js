import { SITE_URL } from '@/lib/api';
export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/bookmarks', '/login', '/register'] }], sitemap: `${SITE_URL}/sitemap.xml` };
}
