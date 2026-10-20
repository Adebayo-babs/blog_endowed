import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getJSON } from '@/lib/api';
import { openingLine, formatDate } from '@/lib/format';
import PostRow, { TopicLabel } from '@/components/PostRow';
import MostRead from '@/components/MostRead';
import AuthorCard from '@/components/AuthorCard';
import Empty from '@/components/Empty';

export const revalidate = 60;

export default async function Home() {
  const [featured, latest, popular, cats, tags, settingsRes] = await Promise.all([
    getJSON('/posts?featured=true&limit=1'),
    getJSON('/posts?limit=8'),
    getJSON('/posts/popular?limit=5'),
    getJSON('/categories'),
    getJSON('/posts/tags'),
    getJSON('/settings'),
  ]);
  const settings = settingsRes?.settings || {};
  const all = latest?.posts || [];
  const hero = featured?.posts?.[0] || all[0];
  const rest = all.filter((p) => p._id !== hero?._id).slice(0, 6);
  const topics = (cats?.categories || []).filter((c) => c.count > 0);

  if (!hero) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <Empty title="The first story is on its way">
          {settings.authorName || 'The writer'} is putting the finishing touches on it. Create an account now and you’ll be ready to save it and leave a comment.
        </Empty>
      </div>
    );
  }

  return (
    <>
      {/* Hero: the story's own opening line does the talking */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          <div>
            <TopicLabel category={hero.category} />
            <Link href={`/blog/${hero.slug}`} className="group mt-5 block">
              <blockquote className="font-serif text-[2.1rem] italic leading-[1.12] tracking-[-0.01em] text-ink sm:text-5xl lg:text-[3.6rem]">
                <span aria-hidden className="block h-[0.62em] font-serif text-[1.9em] not-italic leading-[1] text-marigold">“</span>
                {openingLine(hero.excerpt).replace(/^[“"]\s*/, '').replace(/[”"]$/, '')}
              </blockquote>
              <h1 className="mt-8 text-2xl font-bold tracking-[-0.02em] sm:text-[1.9rem]">
                <span className="marker">{hero.title}</span>
              </h1>
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={`/blog/${hero.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-indigo px-5 py-3 font-semibold text-on-indigo hover:bg-ink hover:text-paper">
                Read the story <ArrowUpRight size={18} aria-hidden />
              </Link>
              <p className="text-muted">
                {formatDate(hero.publishedAt)}, {hero.readingTime} min read
              </p>
            </div>
          </div>

          <Link href={`/blog/${hero.slug}`} tabIndex={-1} aria-hidden
            className="relative block aspect-[4/3] max-h-[560px] sm:aspect-[4/5] overflow-hidden rounded-[2rem] bg-indigo-soft">
            {hero.coverImage && (
              <Image src={hero.coverImage} alt="" fill priority sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" />
            )}
          </Link>
        </div>
      </section>

      {topics.length > 0 && (
        <section aria-labelledby="topics-heading" className="border-y border-line bg-surface/60">
          <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-4 sm:px-6">
            <h2 id="topics-heading" className="shrink-0 font-serif text-lg italic text-muted">Read about</h2>
            <ul className="scrollbar-none -my-1 flex gap-2 overflow-x-auto py-1">
              {topics.map((c) => (
                <li key={c._id}>
                  <Link href={`/topics/${c.slug}`}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-[0.95rem] font-medium hover:border-indigo">
                    <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    {c.name}
                    <span className="text-muted">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="mx-auto grid max-w-6xl gap-14 px-4 pt-12 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="latest">
          <div className="flex items-baseline justify-between">
            <h2 id="latest" className="text-2xl font-bold tracking-[-0.02em]">Latest stories</h2>
            <Link href="/blog" className="font-semibold text-indigo underline-offset-4 hover:underline">See all</Link>
          </div>
          {rest.length ? (
            <div className="divide-y divide-line">
              {rest.map((p, i) => <PostRow key={p._id} post={p} priority={i < 2} />)}
            </div>
          ) : (
            <p className="mt-6 text-ink-2">More stories are coming soon.</p>
          )}
        </section>

        <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <MostRead posts={popular?.posts} />
          <AuthorCard settings={settings} compact />
          {tags?.tags?.length > 0 && (
            <section aria-labelledby="tags-heading">
              <h2 id="tags-heading" className="text-lg font-bold">Tags</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tags.tags.slice(0, 18).map((t) => (
                  <li key={t.name}>
                    <Link href={`/tags/${encodeURIComponent(t.name)}`}
                      className="inline-block rounded-full bg-sunken px-3 py-1.5 text-sm text-ink-2 hover:bg-marigold-soft hover:text-ink">
                      #{t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
