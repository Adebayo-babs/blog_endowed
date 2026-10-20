'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bookmark, LayoutDashboard, LogOut, Menu, Search, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';
import { useAuth } from './AuthProvider';

const NAV = [
  { href: '/blog', label: 'Stories' },
  { href: '/topics', label: 'Topics' },
  { href: '/about', label: 'About' },
];

export default function Header({ siteName }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => { setOpen(false); setMenu(false); }, [pathname]);
  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const active = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo name={siteName} />

        <nav aria-label="Main" className="ml-8 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`rounded-full px-3.5 py-2 text-[0.95rem] font-medium ${active(n.href) ? 'bg-indigo-soft text-ink' : 'text-ink-2 hover:text-ink'}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/search" aria-label="Search stories"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-2 hover:bg-indigo-soft hover:text-ink">
            <Search size={19} />
          </Link>
          <ThemeToggle />

          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu"
                className="ml-1 rounded-full" aria-label="Your account">
                <Avatar src={user.avatar} name={user.name} size={36} />
              </button>
              {menu && (
                <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl shadow-indigo/10">
                  <p className="px-3 pb-2 pt-1.5 text-sm text-muted">Signed in as <span className="font-medium text-ink">{user.name}</span></p>
                  {user.role === 'admin' && (
                    <Link role="menuitem" href="/admin" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.95rem] hover:bg-indigo-soft">
                      <LayoutDashboard size={17} /> Dashboard
                    </Link>
                  )}
                  <Link role="menuitem" href="/bookmarks" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.95rem] hover:bg-indigo-soft">
                    <Bookmark size={17} /> Saved stories
                  </Link>
                  <button role="menuitem" onClick={() => { logout(); router.refresh(); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.95rem] hover:bg-indigo-soft">
                    <LogOut size={17} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/login?next=${encodeURIComponent(pathname)}`}
              className="ml-1 hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-indigo sm:inline-block">
              Sign in
            </Link>
          )}

          <button className="grid h-10 w-10 place-items-center rounded-full md:hidden" onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-line bg-paper px-4 pb-5 pt-3 md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`block rounded-xl px-3 py-3 text-lg font-medium ${active(n.href) ? 'bg-indigo-soft' : ''}`}>{n.label}</Link>
          ))}
          {!user && (
            <Link href="/login" className="mt-3 block rounded-full bg-ink px-4 py-3 text-center font-semibold text-paper">Sign in</Link>
          )}
        </nav>
      )}
    </header>
  );
}
