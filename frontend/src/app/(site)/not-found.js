import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-xl place-content-center px-4 text-center">
      <p className="font-serif text-8xl italic text-marigold" aria-hidden>“</p>
      <h1 className="text-3xl font-extrabold tracking-[-0.02em]">This page has turned its last leaf</h1>
      <p className="mt-3 font-serif text-lg text-ink-2">The link may be old, or the story may have moved. The rest of the blog is right where you left it.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="rounded-full bg-ink px-5 py-2.5 font-semibold text-paper hover:bg-indigo">Go home</Link>
        <Link href="/search" className="rounded-full border border-line px-5 py-2.5 font-semibold hover:border-indigo">Search stories</Link>
      </div>
    </div>
  );
}
