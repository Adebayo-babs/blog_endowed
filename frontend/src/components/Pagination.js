import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, makeHref }) {
  if (pages <= 1) return null;
  const btn = 'inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-indigo hover:text-indigo';
  return (
    <nav aria-label="Pages" className="mt-10 flex items-center justify-between gap-4">
      {page > 1 ? <Link className={btn} href={makeHref(page - 1)}><ChevronLeft size={16} /> Newer</Link> : <span />}
      <span className="text-sm text-muted">Page {page} of {pages}</span>
      {page < pages ? <Link className={btn} href={makeHref(page + 1)}>Older <ChevronRight size={16} /></Link> : <span />}
    </nav>
  );
}
