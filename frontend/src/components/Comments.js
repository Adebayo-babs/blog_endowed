'use client';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { useAuth } from './AuthProvider';
import Avatar from './Avatar';
import { SignInPrompt } from './PostClient';

function Composer({ onSubmit, placeholder = 'Share what this stirred in you…', autoFocus, onCancel }) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true); setError('');
    try { await onSubmit(body); setBody(''); } catch (err) { setError(err.message); }
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="sr-only" htmlFor={placeholder}>Your comment</label>
      <textarea id={placeholder} value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={2000}
        autoFocus={autoFocus} placeholder={placeholder}
        className="w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3 font-serif text-[1.05rem] placeholder:text-muted focus:border-indigo focus:outline-none" />
      {error && <p role="alert" className="text-sm text-rose">{error}</p>}
      <div className="flex items-center gap-3">
        <button disabled={busy || !body.trim()}
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-indigo disabled:opacity-40">
          {busy ? 'Posting…' : 'Post comment'}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="text-sm font-semibold text-muted hover:text-ink">Cancel</button>}
      </div>
    </form>
  );
}

function CommentItem({ c, user, onReply, onDelete, isReply }) {
  const isAdmin = c.user?.role === 'admin';
  return (
    <div className="flex gap-3.5">
      <Avatar src={c.user?.avatar} name={c.user?.name} size={isReply ? 34 : 40} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2.5 text-sm">
          <span className="font-semibold text-ink">{c.user?.name || 'Reader'}</span>
          {isAdmin && <span className="rounded-full bg-marigold-soft px-2 py-0.5 text-xs font-semibold text-ink">Writer</span>}
          <span className="text-muted">{timeAgo(c.createdAt)}</span>
        </p>
        <p className="mt-1 whitespace-pre-line font-serif text-[1.06rem] leading-relaxed text-ink-2">{c.body}</p>
        <div className="mt-1.5 flex gap-4 text-sm font-semibold text-muted">
          {!isReply && user && <button onClick={() => onReply(c._id)} className="hover:text-indigo">Reply</button>}
          {user && (user.id === c.user?._id || user.role === 'admin') && (
            <button onClick={() => onDelete(c._id)} className="inline-flex items-center gap-1 hover:text-rose"><Trash2 size={14} /> Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Comments({ postId, initialCount = 0 }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    api(`/comments/post/${postId}`).then((d) => setComments(d.comments)).catch(() => setComments([]));
  }, [postId]);

  const add = async (body, parent = null) => {
    const { comment } = await api(`/comments/post/${postId}`, { method: 'POST', body: { body, parent } });
    setComments((cs) => [...cs, comment]);
    setReplyTo(null);
  };
  const remove = async (id) => {
    if (!confirm('Delete this comment?')) return;
    await api(`/comments/${id}`, { method: 'DELETE' });
    setComments((cs) => cs.filter((c) => c._id !== id && c.parent !== id));
  };

  const top = (comments || []).filter((c) => !c.parent);
  const replies = (id) => (comments || []).filter((c) => c.parent === id);
  const count = comments ? comments.length : initialCount;

  return (
    <section id="comments" aria-labelledby="comments-heading" className="scroll-mt-24">
      <h2 id="comments-heading" className="text-2xl font-bold tracking-[-0.02em]">
        {count ? `${count} ${count === 1 ? 'comment' : 'comments'}` : 'Comments'}
      </h2>
      <div className="mt-6">
        {user ? <Composer onSubmit={(b) => add(b)} /> : <SignInPrompt>to join the conversation.</SignInPrompt>}
      </div>

      {comments === null ? (
        <p className="mt-8 text-muted">Loading comments…</p>
      ) : top.length === 0 ? (
        <p className="mt-8 font-serif text-lg italic text-muted">No comments yet. Yours could be the first.</p>
      ) : (
        <ul className="mt-10 space-y-8">
          {top.map((c) => (
            <li key={c._id}>
              <CommentItem c={c} user={user} onReply={setReplyTo} onDelete={remove} />
              {(replies(c._id).length > 0 || replyTo === c._id) && (
                <ul className="ml-[3.3rem] mt-5 space-y-5 border-l-2 border-line pl-5">
                  {replies(c._id).map((r) => (
                    <li key={r._id}><CommentItem c={r} user={user} onDelete={remove} isReply /></li>
                  ))}
                  {replyTo === c._id && (
                    <li><Composer autoFocus placeholder={`Reply to ${c.user?.name}…`} onSubmit={(b) => add(b, c._id)} onCancel={() => setReplyTo(null)} /></li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
