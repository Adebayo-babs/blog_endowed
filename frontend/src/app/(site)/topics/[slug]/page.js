import { notFound } from 'next/navigation';
import { getJSON } from '@/lib/api';
import StoryList from '@/components/StoryList';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = await getJSON(`/categories/${slug}`);
  if (!d?.category) return { title: 'Topic not found' };
  return { title: `${d.category.name} stories`, description: d.category.description, alternates: { canonical: `/topics/${slug}` } };
}

export default async function TopicPage({ params, searchParams }) {
  const { slug } = await params;
  const page = Number((await searchParams).page) || 1;
  const [cat, data] = await Promise.all([getJSON(`/categories/${slug}`), getJSON(`/posts?category=${slug}&page=${page}&limit=9`)]);
  if (!cat?.category) notFound();
  const c = cat.category;
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 md:pt-16">
      <p className="inline-flex items-center gap-2 font-serif text-lg italic text-muted">
        <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: c.color }} /> Topic
      </p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{c.name}</h1>
      {c.description && <p className="mt-3 max-w-xl font-serif text-xl text-ink-2">{c.description}</p>}
      <div className="mt-6">
        <StoryList data={data} makeHref={(n) => `/topics/${slug}?page=${n}`} emptyTitle={`No ${c.name.toLowerCase()} stories yet`} />
      </div>
    </div>
  );
}
