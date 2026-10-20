'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { PageTitle, Toast, btn } from '@/components/admin/ui';
import useToast from '@/components/admin/useToast';

export default function CommentsAdmin() {
  const [comments, setComments] = useState(null);
  const [toast, show] = useToast();
  useEffect(() => { api('/admin/comments').then((d) => setComments(d.comments)); }, []);

  const toggle = async (c) => {
    await api(`/admin/comments/${c._id}`, { method: 'PATCH', body: { hidden: !c.hidden } });
    setComments((cs) => cs.map((x) => (x._id === c._id ? { ...x, hidden: !c.hidden } : x)));
    show(c.hidden ? 'Comment shown' : 'Comment hidden');
  };
  const remove = async (c) => {
    if (!confirm('Delete this comment and its replies?')) return;
    await api(`/comments/${c._id}`, { method: 'DELETE' });
    setComments((cs) => cs.filter((x) => x._id !== c._id && x.parent !== c._id));
    show('Comment deleted');
  };

  return (
    <>
      <PageTitle title="Comments">Hide a comment to take it off the blog without deleting it.</PageTitle>
      {comments === null ? <p className="text-muted">Loading…</p> : comments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No comments yet. They’ll show up here as readers respond.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {comments.map((c) => (
            <li key={c._id} className={`flex flex-wrap gap-4 p-4 ${c.hidden ? 'opacity-55' : ''}`}>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{c.user?.name || 'Deleted reader'}</span>{' '}
                  <span className="text-muted">{c.user?.email}</span>{' '}
                  <span className="text-muted">on</span>{' '}
                  <Link href={`/blog/${c.post?.slug}#comments`} target="_blank" className="font-medium text-indigo hover:underline">{c.post?.title || 'a deleted story'}</Link>
                  <span className="text-muted">, {timeAgo(c.createdAt)}</span>
                  {c.parent && <span className="ml-2 rounded-full bg-sunken px-2 py-0.5 text-xs">Reply</span>}
                  {c.hidden && <span className="ml-2 rounded-full bg-marigold-soft px-2 py-0.5 text-xs font-semibold">Hidden</span>}
                </p>
                <p className="mt-1.5 whitespace-pre-line text-ink-2">{c.body}</p>
              </div>
              <div className="flex items-start gap-1">
                <button onClick={() => toggle(c)} className={btn.ghost}>{c.hidden ? <><Eye size={15} /> Show</> : <><EyeOff size={15} /> Hide</>}</button>
                <button onClick={() => remove(c)} className={btn.danger} aria-label="Delete comment"><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Toast {...(toast || {})} />
    </>
  );
}
