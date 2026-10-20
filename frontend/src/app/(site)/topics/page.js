import Link from 'next/link';
import { getJSON } from '@/lib/api';

export const revalidate = 300;
export const metadata = { title: 'Topics', description: 'Faith, purpose, relationships, campus life and career. Find stories by what you’re going through.', alternates: { canonical: '/topics' } };

export default async function TopicsPage() {
  const data = await getJSON('/categories');
  const topics = data?.categories || [];
  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 md:pt-16">
      <h1 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">What are you going through?</h1>
      <p className="mt-3 max-w-xl font-serif text-xl text-ink-2">Every story sits under a topic. Start with the one that sounds like your week.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {topics.map((c) => (
          <li key={c._id}>
            <Link href={`/topics/${c.slug}`} className="group flex h-full gap-5 rounded-3xl border border-line bg-surface p-6 hover:border-indigo">
              <span aria-hidden className="mt-1.5 h-4 w-4 shrink-0 rounded-full" style={{ background: c.color }} />
              <span>
                <span className="flex items-baseline gap-3">
                  <span className="marker text-2xl font-bold">{c.name}</span>
                  <span className="text-sm text-muted">{c.count} {c.count === 1 ? 'story' : 'stories'}</span>
                </span>
                {c.description && <span className="mt-2 block font-serif text-lg leading-relaxed text-ink-2">{c.description}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
