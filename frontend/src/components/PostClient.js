'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bookmark, Check, Heart, Link2, Share2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from './AuthProvider';

export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById('story');
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(total, 1))));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-1">
      <div className="h-full origin-left bg-marigold" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

/** Counts one view per story per browser session. */
export function ViewTracker({ slug }) {
  useEffect(() => {
    const key = `ew_viewed_${slug}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch {}
    api(`/posts/${slug}/view`, { method: 'POST' }).catch(() => {});
  }, [slug]);
  return null;
}

function useNeedsAccount() {
  const router = useRouter();
  const pathname = usePathname();
  return () => router.push(`/login?next=${encodeURIComponent(pathname)}&reason=engage`);
}

export function PostActions({ post, url, layout = 'rail' }) {
  const { user, ready } = useAuth();
  const needAccount = useNeedsAccount();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    api(`/posts/${post.slug}`).then((d) => {
      setLiked(d.liked); setSaved(d.bookmarked); setLikes(d.post.likesCount);
    }).catch(() => {});
  }, [ready, user, post.slug]);

  const toggleLike = async () => {
    if (!user) return needAccount();
    setLiked((v) => !v); setLikes((n) => n + (liked ? -1 : 1));
    try { const d = await api(`/posts/${post._id}/like`, { method: 'POST' }); setLiked(d.liked); setLikes(d.likesCount); }
    catch { setLiked(liked); setLikes(post.likesCount); }
  };
  const toggleSave = async () => {
    if (!user) return needAccount();
    setSaved((v) => !v);
    try { const d = await api(`/posts/${post._id}/bookmark`, { method: 'POST' }); setSaved(d.bookmarked); }
    catch { setSaved(saved); }
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post.title, text: post.excerpt, url }); return; } catch { return; }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const rail = layout === 'rail';
  const base = rail
    ? 'flex flex-col items-center gap-1 text-xs font-semibold text-muted'
    : 'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink-2';
  const circle = rail ? 'grid h-12 w-12 place-items-center rounded-full border border-line bg-surface hover:border-indigo' : '';

  return (
    <div className={rail ? 'flex flex-col gap-5' : 'flex items-center justify-around'}>
      <button onClick={toggleLike} aria-pressed={liked} className={base} aria-label={liked ? 'Unlike this story' : 'Like this story'}>
        <span className={circle}><Heart size={20} className={liked ? 'fill-rose text-rose' : ''} /></span>
        <span aria-live="polite">{likes}</span>
      </button>
      <button onClick={toggleSave} aria-pressed={saved} className={base} aria-label={saved ? 'Remove from saved' : 'Save for later'}>
        <span className={circle}><Bookmark size={20} className={saved ? 'fill-indigo text-indigo' : ''} /></span>
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>
      <button onClick={share} className={base} aria-label="Share this story">
        <span className={circle}>{copied ? <Check size={20} className="text-indigo" /> : <Share2 size={20} />}</span>
        <span>{copied ? 'Copied' : 'Share'}</span>
      </button>
    </div>
  );
}

export function ShareLinks({ title, url }) {
  const [copied, setCopied] = useState(false);
  const t = encodeURIComponent(title), u = encodeURIComponent(url);
  const links = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
    { label: 'X', href: `https://x.com/intent/tweet?text=${t}&url=${u}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-semibold">Share this story</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium hover:border-indigo hover:text-indigo">{l.label}</a>
      ))}
      <button onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium hover:border-indigo hover:text-indigo">
        {copied ? <Check size={15} /> : <Link2 size={15} />} {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  );
}

export function SignInPrompt({ children }) {
  const pathname = usePathname();
  return (
    <p className="text-ink-2">
      <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-semibold text-indigo underline underline-offset-4">Sign in</Link>
      {' '}or{' '}
      <Link href={`/register?next=${encodeURIComponent(pathname)}`} className="font-semibold text-indigo underline underline-offset-4">create a free account</Link>
      {' '}{children}
    </p>
  );
}
