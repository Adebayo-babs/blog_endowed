import Link from 'next/link';

/** "The Endowed Academy" → small "the", bold "endowed", italic "academy". */
export default function Logo({ name = 'The Endowed Academy', className = '' }) {
  const words = (name || 'The Endowed Academy').trim().split(/\s+/);
  const lead = /^the$/i.test(words[0]) && words.length > 1 ? words.shift() : null;
  const [first, ...rest] = words;
  return (
    <Link href="/" className={`group inline-flex items-baseline gap-1 text-ink ${className}`} aria-label={`${name}, home`}>
      {lead && <span className="mr-0.5 font-serif text-[1.05rem] italic leading-none text-muted lowercase">{lead}</span>}
      <span className="font-sans text-[1.45rem] font-extrabold tracking-[-0.03em] lowercase leading-none">{first}</span>
      {rest.length > 0 && (
        <span className="font-serif text-[1.5rem] italic leading-none text-indigo lowercase">{rest.join(' ')}</span>
      )}
      <span aria-hidden className="ml-0.5 inline-block h-2 w-2 rounded-full bg-marigold transition-transform group-hover:scale-125" />
    </Link>
  );
}
