import Link from 'next/link';
import { getJSON } from '@/lib/api';
import StoryList from '@/components/StoryList';

export const metadata = { title: 'All stories', description: 'Every story, newest first. Filter by topic or see what other readers love most.', alternates: { canonical: '/blog' } };

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const sort = sp.sort === 'popular' ? 'popular' : 'latest';
  const category = sp.topic || '';
  const qs = new URLSearchParams({ page, limit: 9, sort, ...(category && { category }) });
  const [data, cats] = await Promise.all([getJSON(`/posts?${qs}`), getJSON('/categories')]);
  const topics = (cats?.categories || []).filter((c) => c.count > 0);

  const href = (over) => {
    const p = new URLSearchParams({ ...(sort !== 'latest' && { sort }), ...(category && { topic: category }), ...over });
    for (const [k, v] of [...p]) if (!v || v === '1' && k === 'page') p.delete(k);
    const s = p.toString();
    return `/blog${s ? `?${s}` : ''}`;
  };
  const chip = (on) => `inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] font-medium ${on ? 'bg-ink text-paper' : 'border border-line bg-surface hover:border-indigo'}`;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 md:pt-16">
      <h1 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">All stories</h1>
      <p className="mt-3 max-w-xl font-serif text-xl text-ink-2">
        {data?.total ? `${data.total} ${data.total === 1 ? 'story' : 'stories'} so far.` : 'Ideas for writing and teaching, with more on the way.'} Pick a topic or start from the top.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter by topic">
          <li><Link href={href({ topic: '', page: '' })} className={chip(!category)}>Everything</Link></li>
          {topics.map((c) => (
            <li key={c._id}>
              <Link href={href({ topic: c.slug, page: '' })} className={chip(category === c.slug)} aria-current={category === c.slug ? 'true' : undefined}>
                <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 rounded-full bg-sunken p-1 text-sm font-semibold" role="group" aria-label="Sort">
          <Link href={href({ sort: '', page: '' })} className={`rounded-full px-3.5 py-1.5 ${sort === 'latest' ? 'bg-surface shadow-sm' : 'text-muted'}`}>Newest</Link>
          <Link href={href({ sort: 'popular', page: '' })} className={`rounded-full px-3.5 py-1.5 ${sort === 'popular' ? 'bg-surface shadow-sm' : 'text-muted'}`}>Most read</Link>
        </div>
      </div>

      <div className="mt-4">
        <StoryList data={data} makeHref={(n) => href({ page: String(n) })} emptyText="Try another topic, or check back soon." />
      </div>
    </div>
  );
}
