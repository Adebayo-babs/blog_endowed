import { getJSON } from '@/lib/api';
import StoryList from '@/components/StoryList';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const tag = decodeURIComponent((await params).tag);
  return { title: `Stories tagged #${tag}`, alternates: { canonical: `/tags/${encodeURIComponent(tag)}` } };
}

export default async function TagPage({ params, searchParams }) {
  const tag = decodeURIComponent((await params).tag);
  const page = Number((await searchParams).page) || 1;
  const data = await getJSON(`/posts?tag=${encodeURIComponent(tag)}&page=${page}&limit=9`);
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 md:pt-16">
      <h1 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl"><span className="text-marigold">#</span>{tag}</h1>
      <p className="mt-3 font-serif text-xl text-ink-2">{data?.total || 0} {data?.total === 1 ? 'story' : 'stories'} with this tag.</p>
      <div className="mt-6">
        <StoryList data={data} makeHref={(n) => `/tags/${encodeURIComponent(tag)}?page=${n}`} />
      </div>
    </div>
  );
}
