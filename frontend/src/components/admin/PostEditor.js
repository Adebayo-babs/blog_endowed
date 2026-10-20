'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, ImagePlus, X } from 'lucide-react';
import { api, refreshSite, uploadImage } from '@/lib/api';
import { Field, Panel, Toast, btn, inputCls } from './ui';
import useToast from './useToast';

const RichEditor = dynamic(() => import('./RichEditor'), { ssr: false, loading: () => <div className="min-h-[480px] rounded-2xl border border-line bg-surface" /> });

const EMPTY = { title: '', content: '', excerpt: '', coverImage: '', coverAlt: '', category: '', tags: '', status: 'draft', featured: false, slug: '', seoTitle: '', seoDescription: '', publishedAt: '' };
const toLocalInput = (d) => (d ? new Date(new Date(d).getTime() - new Date(d).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

export default function PostEditor({ id }) {
  const router = useRouter();
  const [post, setPost] = useState(id ? null : EMPTY);
  const [cats, setCats] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [restore, setRestore] = useState(null);
  const [savedSlug, setSavedSlug] = useState('');
  const [toast, show] = useToast();
  const coverRef = useRef(null);
  const draftKey = `ew_draft_${id || 'new'}`;

  useEffect(() => {
    api('/categories').then((d) => setCats(d.categories)).catch(() => {});
    if (id) {
      api(`/admin/posts/${id}`).then(({ post: p }) => {
        setPost({ ...EMPTY, ...p, category: p.category || '', tags: (p.tags || []).join(', '), publishedAt: toLocalInput(p.publishedAt) });
        if (p.status === 'published') setSavedSlug(p.slug);
      }).catch((e) => show(e.message, 'error'));
    }
    try {
      const local = JSON.parse(localStorage.getItem(draftKey) || 'null');
      if (local?.title || local?.content) setRestore(local);
    } catch {}
  }, [id]); // eslint-disable-line

  // Keep an unsaved copy in this browser so nothing is lost if the tab closes
  useEffect(() => {
    if (!dirty || !post) return;
    const t = setTimeout(() => { try { localStorage.setItem(draftKey, JSON.stringify(post)); } catch {} }, 800);
    return () => clearTimeout(t);
  }, [post, dirty, draftKey]);

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (k) => (v) => { setPost((p) => ({ ...p, [k]: v?.target ? (v.target.type === 'checkbox' ? v.target.checked : v.target.value) : v })); setDirty(true); };

  const save = useCallback(async (status) => {
    if (!post.title.trim()) return show('Give the story a title first.', 'error');
    setSaving(true);
    try {
      const body = { ...post, status: status || post.status, publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined };
      const res = id
        ? await api(`/admin/posts/${id}`, { method: 'PUT', body })
        : await api('/admin/posts', { method: 'POST', body });
      try { localStorage.removeItem(draftKey); } catch {}
      setDirty(false);
      setPost((p) => ({ ...p, status: res.post.status, slug: res.post.slug, publishedAt: toLocalInput(res.post.publishedAt) }));
      if (res.post.status === 'published') setSavedSlug(res.post.slug);
      refreshSite();
      show(res.post.status === 'published' ? (status === 'published' && post.status !== 'published' ? 'Published' : 'Changes published') : 'Draft saved');
      if (!id) router.replace(`/admin/posts/${res.post._id}`);
    } catch (e) {
      show(e.message, 'error');
    }
    setSaving(false);
  }, [post, id, router, show, draftKey]);

  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); if (post) save(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, post]);

  const uploadCover = async (file) => {
    if (!file) return;
    try { show('Uploading cover…'); set('coverImage')(await uploadImage(file)); show('Cover added'); }
    catch (e) { show(e.message, 'error'); }
  };

  if (!post) return <p className="text-muted">Loading story…</p>;
  const published = post.status === 'published';

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} /> Stories</Link>
        <span className="text-sm text-muted">{saving ? 'Saving…' : dirty ? 'Unsaved changes' : published ? 'Live on the blog' : id ? 'Draft' : 'New story'}</span>
        <div className="ml-auto flex flex-wrap gap-2">
          {savedSlug && <Link href={`/blog/${savedSlug}`} target="_blank" className={btn.ghost}><ExternalLink size={15} /> View</Link>}
          {published ? (
            <>
              <button onClick={() => save('draft')} disabled={saving} className={btn.ghost}>Unpublish</button>
              <button onClick={() => save('published')} disabled={saving} className={btn.primary}>Update story</button>
            </>
          ) : (
            <>
              <button onClick={() => save('draft')} disabled={saving} className={btn.ghost}>Save draft</button>
              <button onClick={() => save('published')} disabled={saving} className={btn.primary}>Publish</button>
            </>
          )}
        </div>
      </div>

      {restore && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-marigold-soft px-4 py-3 text-sm">
          <span>There’s an unsaved version of this story in this browser.</span>
          <button className="font-semibold underline" onClick={() => { setPost({ ...post, ...restore }); setRestore(null); setDirty(true); }}>Restore it</button>
          <button className="font-semibold text-muted underline" onClick={() => { localStorage.removeItem(draftKey); setRestore(null); }}>Discard</button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          <label htmlFor="title" className="sr-only">Title</label>
          <textarea id="title" value={post.title} onChange={set('title')} rows={1} placeholder="Story title"
            className="w-full resize-none bg-transparent text-4xl font-extrabold leading-tight tracking-[-0.03em] placeholder:text-muted/60 focus:outline-none field-sizing-content" />
          <RichEditor value={post.content} onChange={(html) => set('content')(html)} onError={(m) => show(m, 'error')} />
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <Panel title="Cover image">
            {post.coverImage ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-sunken">
                <Image src={post.coverImage} alt="" fill sizes="320px" className="object-cover" />
                <button onClick={() => set('coverImage')('')} aria-label="Remove cover"
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink/80 text-paper"><X size={16} /></button>
              </div>
            ) : (
              <button onClick={() => coverRef.current?.click()}
                className="grid aspect-[16/10] w-full place-items-center rounded-xl border-2 border-dashed border-line text-sm font-semibold text-muted hover:border-indigo hover:text-indigo">
                <span className="flex flex-col items-center gap-2"><ImagePlus size={24} /> Upload a cover</span>
              </button>
            )}
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={(e) => { uploadCover(e.target.files[0]); e.target.value = ''; }} />
            <div className="mt-3"><Field label="Describe the image" htmlFor="alt" hint="Read aloud by screen readers.">
              <input id="alt" value={post.coverAlt} onChange={set('coverAlt')} className={inputCls} /></Field></div>
          </Panel>

          <Panel title="Details">
            <div className="space-y-4">
              <Field label="Topic" htmlFor="cat">
                <select id="cat" value={post.category} onChange={set('category')} className={inputCls}>
                  <option value="">No topic</option>
                  {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Tags" htmlFor="tags" hint="Separate with commas, e.g. exams, faith, first year">
                <input id="tags" value={post.tags} onChange={set('tags')} className={inputCls} />
              </Field>
              <Field label="Summary" htmlFor="excerpt" hint="Shown under the title and in link previews. Leave empty to use the opening lines.">
                <textarea id="excerpt" rows={3} maxLength={400} value={post.excerpt} onChange={set('excerpt')} className={inputCls} />
              </Field>
              <label className="flex items-start gap-3 rounded-xl bg-sunken p-3 text-sm">
                <input type="checkbox" checked={post.featured} onChange={set('featured')} className="mt-0.5 h-4 w-4 accent-[var(--indigo)]" />
                <span><span className="font-semibold">Feature on the home page</span><br /><span className="text-muted">Replaces the current featured story.</span></span>
              </label>
              <Field label="Publish date" htmlFor="date" hint="Set a future date to schedule it.">
                <input id="date" type="datetime-local" value={post.publishedAt} onChange={set('publishedAt')} className={inputCls} />
              </Field>
            </div>
          </Panel>

          <Panel title="Search and sharing">
            <div className="space-y-4">
              <Field label="Web address" htmlFor="slug" hint={post.slug ? `/blog/${post.slug}` : 'Made from the title if left empty.'}>
                <input id="slug" value={post.slug} onChange={set('slug')} className={inputCls} />
              </Field>
              <Field label="Search title" htmlFor="seot"><input id="seot" value={post.seoTitle} onChange={set('seoTitle')} placeholder={post.title} className={inputCls} /></Field>
              <Field label="Search description" htmlFor="seod" hint={`${(post.seoDescription || '').length}/160`}>
                <textarea id="seod" rows={3} maxLength={160} value={post.seoDescription} onChange={set('seoDescription')} className={inputCls} />
              </Field>
            </div>
          </Panel>
        </div>
      </div>
      <Toast {...(toast || {})} />
    </>
  );
}
