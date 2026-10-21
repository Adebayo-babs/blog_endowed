import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { getJSON, SITE_URL } from '@/lib/api';
import { formatDate, compact } from '@/lib/format';
import { TopicLabel } from '@/components/PostRow';
import PostRow from '@/components/PostRow';
import AuthorCard from '@/components/AuthorCard';
import Avatar from '@/components/Avatar';
import Comments from '@/components/Comments';
import { PostActions, ReadingProgress, ShareLinks, ViewTracker } from '@/components/PostClient';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getJSON(`/posts/${slug}`);
  if (!data?.post) return { title: 'Story not found' };
  const p = data.post;
  const title = p.seoTitle || p.title;
  const description = p.seoDescription || p.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: {
      type: 'article', title, description, url: `/blog/${p.slug}`,
      publishedTime: p.publishedAt, modifiedTime: p.updatedAt, tags: p.tags,
      images: p.coverImage ? [{ url: p.coverImage, alt: p.coverAlt || p.title }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: p.coverImage ? [p.coverImage] : undefined },
  };
}

export default async function StoryPage({ params }) {
  const { slug } = await params;
  const [data, settingsRes] = await Promise.all([getJSON(`/posts/${slug}`), getJSON('/settings')]);
  if (!data?.post) notFound();
  const { post, related = [], prev, next } = data;
  const settings = settingsRes?.settings || {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  // Only show the summary under the title if it isn't just the opening lines repeated
  const norm = (t) => t.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/[^\p{L}\p{N}]+/gu, '').toLowerCase();
  const showSummary = post.excerpt && !norm(post.content).startsWith(norm(post.excerpt.replace(/…$/, '')).slice(0, 60));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: settings.authorName },
    publisher: { '@type': 'Organization', name: settings.siteName },
    mainEntityOfPage: url,
    keywords: post.tags?.join(', '),
  };

  return (
    <>
      <ReadingProgress />
      <ViewTracker slug={post.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="pb-6">
        <header className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 md:pt-16">
          <TopicLabel category={post.category} />
          <h1 className="mt-4 text-[2.3rem] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-5xl md:text-[3.4rem]">
            {post.title}
          </h1>
          {showSummary && (
            <p className="mt-5 font-serif text-xl italic leading-relaxed text-ink-2 sm:text-[1.4rem]">{post.excerpt}</p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line py-4">
            <div className="flex items-center gap-3">
              <Avatar src={settings.authorAvatar} name={settings.authorName} size={42} />
              <div className="leading-tight">
                <p className="font-semibold">{settings.authorName}</p>
                <p className="text-sm text-muted"><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></p>
              </div>
            </div>
            <p className="text-sm text-muted">{post.readingTime} min read</p>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted"><Eye size={15} aria-hidden /> {compact(post.views)} reads</p>
            <Link href="#comments" className="text-sm font-semibold text-indigo hover:underline underline-offset-4">
              {post.commentsCount ? `${post.commentsCount} comments` : 'Leave a comment'}
            </Link>
          </div>
        </header>

        {post.coverImage && (
          <figure className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[1.75rem] bg-indigo-soft">
              <Image src={post.coverImage} alt={post.coverAlt || ''} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
            </div>
            {post.coverAlt && <figcaption className="mt-3 text-center text-sm text-muted">{post.coverAlt}</figcaption>}
          </figure>
        )}

        <div className="relative mx-auto mt-12 max-w-3xl px-4 sm:px-6">
          <aside aria-label="Story actions" className="absolute -left-20 top-0 hidden h-full xl:block">
            <div className="sticky top-28"><PostActions post={post} url={url} /></div>
          </aside>
          <div id="story" className="story dropcap" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <footer className="mx-auto mt-14 max-w-3xl space-y-10 px-4 sm:px-6">
          {post.tags?.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t}>
                  <Link href={`/tags/${encodeURIComponent(t)}`} className="inline-block rounded-full bg-sunken px-3 py-1.5 text-sm text-ink-2 hover:bg-marigold-soft hover:text-ink">#{t}</Link>
                </li>
              ))}
            </ul>
          )}
          <ShareLinks title={post.title} url={url} />
          <AuthorCard settings={settings} />

          {(prev || next) && (
            <nav aria-label="More stories" className="grid gap-4 sm:grid-cols-2">
              {prev ? (
                <Link href={`/blog/${prev.slug}`} className="group rounded-2xl border border-line p-5 hover:border-indigo">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted"><ArrowLeft size={15} /> Earlier story</span>
                  <span className="marker mt-1 block font-semibold leading-snug">{prev.title}</span>
                </Link>
              ) : <span />}
              {next && (
                <Link href={`/blog/${next.slug}`} className="group rounded-2xl border border-line p-5 text-right hover:border-indigo">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted">Newer story <ArrowRight size={15} /></span>
                  <span className="marker mt-1 block font-semibold leading-snug">{next.title}</span>
                </Link>
              )}
            </nav>
          )}

          <Comments postId={post._id} initialCount={post.commentsCount} />
        </footer>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
          <h2 id="related" className="text-2xl font-bold tracking-[-0.02em]">You might also like</h2>
          <div className="divide-y divide-line">{related.map((p) => <PostRow key={p._id} post={p} />)}</div>
        </section>
      )}

      {/* Mobile action bar */}
      <div className="fixed inset-x-3 bottom-3 z-30 rounded-full border border-line bg-surface/95 px-2 py-1 shadow-lg shadow-indigo/10 backdrop-blur xl:hidden">
        <PostActions post={post} url={url} layout="bar" />
      </div>
      <div className="h-16 xl:hidden" aria-hidden />
    </>
  );
}
