import Link from 'next/link';

export default function Empty({ title, children, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center">
      <p className="font-serif text-5xl italic text-marigold" aria-hidden>“</p>
      <h2 className="mt-2 text-xl font-bold">{title}</h2>
      {children && <p className="mx-auto mt-2 max-w-md text-ink-2">{children}</p>}
      {action && (
        <Link href={action.href} className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-indigo">
          {action.label}
        </Link>
      )}
    </div>
  );
}
