import Link from 'next/link';
import Logo from './Logo';
import Socials from './Socials';

export default function Footer({ settings = {} }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line bg-sunken">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo name={settings.siteName} />
          <p className="mt-4 max-w-sm font-serif text-lg leading-relaxed text-ink-2">{settings.tagline}</p>
          <Socials socials={settings.socials} className="mt-6" />
        </div>
        <div>
          <h2 className="font-semibold">Read</h2>
          <ul className="mt-3 space-y-2 text-ink-2">
            <li><Link className="hover:text-indigo" href="/blog">All stories</Link></li>
            <li><Link className="hover:text-indigo" href="/blog?sort=popular">Most read</Link></li>
            <li><Link className="hover:text-indigo" href="/topics">Topics</Link></li>
            <li><Link className="hover:text-indigo" href="/search">Search</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">You</h2>
          <ul className="mt-3 space-y-2 text-ink-2">
            <li><Link className="hover:text-indigo" href="/about">About the writer</Link></li>
            <li><Link className="hover:text-indigo" href="/bookmarks">Saved stories</Link></li>
            <li><Link className="hover:text-indigo" href="/register">Create a free account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-muted sm:px-6">© {year} {settings.siteName || 'Endowed Writes'}. Written with love for every student still figuring it out.</p>
      </div>
    </footer>
  );
}
