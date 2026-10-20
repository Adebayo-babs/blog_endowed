'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Eye, Heart, MessageCircle, Pencil, Star, Trash2 } from 'lucide-react';
import { api, refreshSite } from '@/lib/api';
import { shortDate } from '@/lib/format';
import { PageTitle, Toast, btn, inputCls } from '@/components/admin/ui';
import useToast from '@/components/admin/useToast';

export default function PostsAdmin() {
  const [posts, setPosts] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [toast, show] = useToast();

  const load = () => api(`/admin/posts?${new URLSearchParams({ ...(status && { status }), ...(q && { q }) })}`).then((d) => setPosts(d.posts));
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [status, q]); // eslint-disable-line

  const remove = async (p) => {
    if (!confirm(`Delete “${p.title}”? Its comments and stats go with it. This can’t be undone.`)) return;
    await api(`/admin/posts/${p._id}`, { method: 'DELETE' });
    setPosts((ps) => ps.filter((x) => x._id !== p._id));
    refreshSite();
    show('Story deleted');
  };

  return (
    <>
      <PageTitle title="Stories" action={<Link href="/admin/posts/new" className={btn.primary}>Write a story</Link>}>
        Drafts stay private until you publish them.
      </PageTitle>
      <div className="mb-5 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a story by title" className={`${inputCls} max-w-xs`} aria-label="Find a story" />
        <div className="flex rounded-full bg-sunken p-1 text-sm font-semibold" role="group" aria-label="Status">
          {[['', 'All'], ['published', 'Published'], ['draft', 'Drafts']].map(([v, l]) => (
            <button key={v} onClick={() => setStatus(v)} aria-pressed={status === v}
              className={`rounded-full px-3.5 py-1.5 ${status === v ? 'bg-surface shadow-sm' : 'text-muted'}`}>{l}</button>
          ))}
        </div>
      </div>

      {posts === null ? <p className="text-muted">Loading…</p> : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="font-semibold">No stories {status === 'draft' ? 'in drafts' : 'yet'}.</p>
          <Link href="/admin/posts/new" className={`${btn.primary} mt-4`}>Write your first story</Link>
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {posts.map((p) => (
            <li key={p._id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-indigo-soft">
                {p.coverImage && <Image src={p.coverImage} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  {p.featured && <Star size={15} className="fill-marigold text-marigold" aria-label="Featured" />}
                  <Link href={`/admin/posts/${p._id}`} className="truncate font-semibold hover:text-indigo">{p.title}</Link>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === 'published' ? 'bg-indigo-soft text-indigo' : 'bg-marigold-soft text-ink'}`}>
                    {p.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  <span>{p.status === 'published' ? shortDate(p.publishedAt) : `Edited ${shortDate(p.updatedAt)}`}</span>
                  {p.category && <span>{p.category.name}</span>}
                  <span className="inline-flex items-center gap-1"><Eye size={14} />{p.views}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={14} />{p.likesCount}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle size={14} />{p.commentsCount}</span>
                </p>
              </div>
              <div className="flex gap-1">
                {p.status === 'published' && <Link href={`/blog/${p.slug}`} target="_blank" className={btn.ghost}>View</Link>}
                <Link href={`/admin/posts/${p._id}`} className={btn.ghost}><Pencil size={15} /> Edit</Link>
                <button onClick={() => remove(p)} className={btn.danger} aria-label={`Delete ${p.title}`}><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Toast {...(toast || {})} />
    </>
  );
}
