import { getJSON, SITE_URL } from '@/lib/api';

export const revalidate = 3600;

export default async function sitemap() {
  const [posts, cats] = await Promise.all([getJSON('/posts/slugs'), getJSON('/categories')]);
  const fixed = ['', '/blog', '/topics', '/about'].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly', priority: p ? 0.7 : 1 }));
  return [
    ...fixed,
    ...(posts?.posts || []).map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
    ...(cats?.categories || []).map((c) => ({ url: `${SITE_URL}/topics/${c.slug}`, priority: 0.5 })),
  ];
}
