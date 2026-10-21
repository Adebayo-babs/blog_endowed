import Link from 'next/link';
import Avatar from './Avatar';
import Socials from './Socials';

export default function AuthorCard({ settings = {}, compact = false }) {
  return (
    <section aria-label="About the writer" className="rounded-3xl bg-indigo-soft p-6">
      <div className="flex items-center gap-4">
        <Avatar src={settings.authorAvatar || '/writer/avatar.webp'} name={settings.authorName} size={compact ? 52 : 64} />
        <div>
          <p className="text-sm text-muted">Written by</p>
          <p className="text-lg font-bold leading-tight">{settings.authorName}</p>
        </div>
      </div>
      <p className="mt-4 font-serif text-[1.08rem] leading-relaxed text-ink-2">{settings.authorBio}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Socials socials={settings.socials} />
        {!compact && <Link href="/about" className="text-sm font-semibold text-indigo underline-offset-4 hover:underline">More about me</Link>}
      </div>
    </section>
  );
}
