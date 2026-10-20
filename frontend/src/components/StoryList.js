import PostRow from './PostRow';
import Pagination from './Pagination';
import Empty from './Empty';

export default function StoryList({ data, makeHref, emptyTitle = 'No stories here yet', emptyText }) {
  const posts = data?.posts || [];
  if (!posts.length) return <div className="mt-8"><Empty title={emptyTitle} action={{ href: '/blog', label: 'Browse all stories' }}>{emptyText}</Empty></div>;
  return (
    <>
      <div className="divide-y divide-line">{posts.map((p, i) => <PostRow key={p._id} post={p} priority={i < 2} />)}</div>
      <Pagination page={data.page} pages={data.pages} makeHref={makeHref} />
    </>
  );
}
