import Link from 'next/link';

export default function MostRead({ posts = [] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="most-read">
      <h2 id="most-read" className="text-lg font-bold">Most read</h2>
      <ol className="mt-4 space-y-1">
        {posts.map((p, i) => (
          <li key={p._id}>
            <Link href={`/blog/${p.slug}`} className="group flex gap-4 rounded-xl py-3">
              <span aria-hidden className="w-7 shrink-0 font-serif text-3xl italic leading-none text-marigold">{i + 1}</span>
              <span>
                <span className="marker font-semibold leading-snug">{p.title}</span>
                <span className="mt-1 block text-sm text-muted">{p.readingTime} min read</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
