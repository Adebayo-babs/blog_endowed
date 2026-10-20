import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';
import { shortDate } from '@/lib/format';

export function TopicLabel({ category, className = '' }) {
  if (!category) return null;
  return (
    <Link href={`/topics/${category.slug}`}
      className={`relative z-10 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-indigo ${className}`}>
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: category.color }} />
      {category.name}
    </Link>
  );
}

export function Meta({ post, className = '' }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted ${className}`}>
      <time dateTime={post.publishedAt}>{shortDate(post.publishedAt)}</time>
      <span>{post.readingTime} min read</span>
      {post.likesCount > 0 && (
        <span className="inline-flex items-center gap-1"><Heart size={14} aria-hidden /> {post.likesCount}<span className="sr-only"> likes</span></span>
      )}
      {post.commentsCount > 0 && (
        <span className="inline-flex items-center gap-1"><MessageCircle size={14} aria-hidden /> {post.commentsCount}<span className="sr-only"> comments</span></span>
      )}
    </p>
  );
}

/** A story in a list. The whole row is clickable; the topic link sits above the overlay. */
export default function PostRow({ post, priority = false }) {
  return (
    <article className="group relative grid gap-5 py-7 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-7">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-indigo-soft">
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.coverAlt || ''} fill sizes="(min-width: 640px) 240px, 100vw"
            priority={priority} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div aria-hidden className="grid h-full place-items-center font-serif text-6xl italic text-indigo/40">“</div>
        )}
      </div>
      <div className="min-w-0">
        <TopicLabel category={post.category} />
        <h3 className="mt-2 text-[1.4rem] font-bold leading-snug tracking-[-0.015em] text-ink">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            <span className="marker">{post.title}</span>
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 font-serif text-[1.08rem] leading-relaxed text-ink-2">{post.excerpt}</p>
        <Meta post={post} className="mt-3" />
      </div>
    </article>
  );
}
