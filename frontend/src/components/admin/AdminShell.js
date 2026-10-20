'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, ExternalLink, FileText, LogOut, Menu, MessageSquare, PenLine, Settings, Tags, Users, X } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import Logo from '../Logo';
import ThemeToggle from '../ThemeToggle';

const NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
  { href: '/admin/posts', label: 'Stories', icon: FileText },
  { href: '/admin/topics', label: 'Topics', icon: Tags },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/readers', label: 'Readers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminShell({ children }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && (!user || user.role !== 'admin')) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);
  useEffect(() => setOpen(false), [pathname]);

  if (!ready || user?.role !== 'admin') {
    return <div className="grid min-h-dvh place-items-center text-muted">Checking your access…</div>;
  }

  const isActive = (n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href));

  const sidebar = (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="px-2 pb-6 pt-2"><Logo /></div>
      <Link href="/admin/posts/new" className="mb-4 inline-flex items-center justify-center gap-2 rounded-full bg-indigo px-4 py-3 font-semibold text-on-indigo hover:bg-ink hover:text-paper">
        <PenLine size={18} /> Write a story
      </Link>
      {NAV.map((n) => (
        <Link key={n.href} href={n.href}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium ${isActive(n) ? 'bg-indigo-soft text-ink' : 'text-ink-2 hover:bg-sunken'}`}>
          <n.icon size={18} /> {n.label}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-line pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-ink-2 hover:bg-sunken">
          <ExternalLink size={18} /> View blog
        </Link>
        <button onClick={() => { logout(); router.push('/'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-ink-2 hover:bg-sunken">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-surface lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72 bg-surface shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-8">
          <button className="grid h-10 w-10 place-items-center rounded-full lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <p className="text-sm text-muted">Signed in as <span className="font-semibold text-ink">{user.name}</span></p>
          <ThemeToggle className="ml-auto" />
        </header>
        <div className="px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
