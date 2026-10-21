import { Search } from 'lucide-react';
import { getJSON } from '@/lib/api';
import StoryList from '@/components/StoryList';

export const metadata = { title: 'Search', robots: { index: false } };

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const page = Number(sp.page) || 1;
  const data = q ? await getJSON(`/posts?q=${encodeURIComponent(q)}&page=${page}&limit=10`, { revalidate: 30 }) : null;
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 md:pt-16">
      <h1 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">Search stories</h1>
      <form action="/search" className="relative mt-8" role="search">
        <label htmlFor="q" className="sr-only">Search stories</label>
        <Search size={22} aria-hidden className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
        <input id="q" name="q" defaultValue={q} autoFocus placeholder="Try “feedback”, “essays” or “lesson plan”"
          className="w-full rounded-full border border-line bg-surface py-4 pl-14 pr-32 font-serif text-xl placeholder:text-muted focus:border-indigo focus:outline-none" />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink px-5 py-2.5 font-semibold text-paper hover:bg-indigo">Search</button>
      </form>
      {q && (
        <div className="mt-8">
          <p className="text-ink-2">{data?.total || 0} {data?.total === 1 ? 'result' : 'results'} for <span className="font-semibold text-ink">“{q}”</span></p>
          <StoryList data={data} makeHref={(n) => `/search?q=${encodeURIComponent(q)}&page=${n}`}
            emptyTitle="Nothing matched that" emptyText="Check the spelling, or try a broader word like “writing” or “teaching”." />
        </div>
      )}
    </div>
  );
}
