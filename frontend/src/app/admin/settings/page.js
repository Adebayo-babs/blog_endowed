'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { api, refreshSite, uploadImage } from '@/lib/api';
import { Field, PageTitle, Panel, Toast, btn, inputCls } from '@/components/admin/ui';
import useToast from '@/components/admin/useToast';
import Avatar from '@/components/Avatar';

const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), { ssr: false });
const SOCIALS = [['instagram', 'Instagram link'], ['x', 'X (Twitter) link'], ['facebook', 'Facebook link'], ['linkedin', 'LinkedIn link'], ['youtube', 'YouTube link'], ['email', 'Contact email']];

export default function SettingsAdmin() {
  const [s, setS] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [toast, show] = useToast();
  const fileRef = useRef(null);

  useEffect(() => { api('/settings').then((d) => setS(d.settings)); }, []);
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });

  const save = async () => {
    try { const d = await api('/admin/settings', { method: 'PUT', body: s }); setS(d.settings); refreshSite(); show('Settings saved'); }
    catch (e) { show(e.message, 'error'); }
  };
  const changePw = async (e) => {
    e.preventDefault();
    try { await api('/auth/password', { method: 'PUT', body: pw }); setPw({ currentPassword: '', newPassword: '' }); show('Password updated'); }
    catch (err) { show(err.message, 'error'); }
  };

  if (!s) return <p className="text-muted">Loading…</p>;
  return (
    <>
      <PageTitle title="Settings" action={<button onClick={save} className={btn.primary}>Save settings</button>}>
        How the blog introduces itself and you.
      </PageTitle>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="The blog">
          <div className="space-y-4">
            <Field label="Blog name" htmlFor="sn" hint="The first word is set bold, the rest in italic."><input id="sn" value={s.siteName} onChange={set('siteName')} className={inputCls} /></Field>
            <Field label="Tagline" htmlFor="tg" hint="Used in the footer and in search results."><textarea id="tg" rows={2} value={s.tagline} onChange={set('tagline')} className={inputCls} /></Field>
          </div>
        </Panel>
        <Panel title="About you">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={s.authorAvatar} name={s.authorName} size={64} />
              <button onClick={() => fileRef.current?.click()} className={btn.ghost}>{s.authorAvatar ? 'Change photo' : 'Upload photo'}</button>
              {s.authorAvatar && <button onClick={() => setS({ ...s, authorAvatar: '' })} className={btn.danger}>Remove</button>}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => {
                const f = e.target.files[0]; e.target.value = '';
                if (f) try { setS({ ...s, authorAvatar: await uploadImage(f) }); show('Photo uploaded. Save to keep it.'); } catch (err) { show(err.message, 'error'); }
              }} />
            </div>
            <Field label="Your name" htmlFor="an"><input id="an" value={s.authorName} onChange={set('authorName')} className={inputCls} /></Field>
            <Field label="Short bio" htmlFor="ab" hint="One or two sentences, shown under every story."><textarea id="ab" rows={3} value={s.authorBio} onChange={set('authorBio')} className={inputCls} /></Field>
          </div>
        </Panel>
        <Panel title="Home page introduction" className="xl:col-span-2">
          <p className="mb-4 text-sm text-ink-2">The “Meet the writer” section on the home page. Leave a photo or the text empty to use what came with the site.</p>
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="flex gap-4">
              {[0, 1].map((i) => {
                const src = s.homePhotos?.[i] || (i === 0 ? '/writer/standing.webp' : '/writer/seated.webp');
                const setPhoto = (url) => { const arr = [...(s.homePhotos || ['', ''])]; while (arr.length < 2) arr.push(''); arr[i] = url; setS({ ...s, homePhotos: arr }); };
                return (
                  <div key={i} className="w-32">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sunken">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                    <label className={`${btn.ghost} mt-2 w-full cursor-pointer`}>
                      {i === 0 ? 'Main photo' : 'Small photo'}
                      <input type="file" accept="image/*" hidden onChange={async (e) => {
                        const f = e.target.files[0]; e.target.value = '';
                        if (f) try { setPhoto(await uploadImage(f)); show('Photo uploaded. Save to keep it.'); } catch (err) { show(err.message, 'error'); }
                      }} />
                    </label>
                    {s.homePhotos?.[i] && <button onClick={() => setPhoto('')} className={`${btn.danger} mt-1 w-full`}>Use original</button>}
                  </div>
                );
              })}
            </div>
            <div className="space-y-4">
              <Field label="Heading" htmlFor="hh" hint={`Leave empty for “Hi, I’m ${s.authorName || 'your name'}.”`}>
                <input id="hh" value={s.homeHeading || ''} onChange={set('homeHeading')} className={inputCls} />
              </Field>
              <Field label="Introduction" htmlFor="hi" hint="Leave a blank line between paragraphs.">
                <textarea id="hi" rows={8} value={s.homeIntro || ''} onChange={set('homeIntro')} className={inputCls}
                  placeholder="Leave empty to use the introduction that came with the site." />
              </Field>
            </div>
          </div>
        </Panel>
        <Panel title="Social links">
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIALS.map(([k, l]) => (
              <Field key={k} label={l} htmlFor={k}>
                <input id={k} value={s.socials?.[k] || ''} onChange={(e) => setS({ ...s, socials: { ...s.socials, [k]: e.target.value } })}
                  placeholder={k === 'email' ? 'you@example.com' : 'https://'} className={inputCls} />
              </Field>
            ))}
          </div>
        </Panel>
        <Panel title="Change your password">
          <form onSubmit={changePw} className="space-y-4">
            <Field label="Current password" htmlFor="cp"><input id="cp" type="password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} className={inputCls} autoComplete="current-password" /></Field>
            <Field label="New password" htmlFor="np" hint="At least 8 characters."><input id="np" type="password" required minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className={inputCls} autoComplete="new-password" /></Field>
            <button className={btn.dark}>Update password</button>
          </form>
        </Panel>
      </div>
      <div className="mt-6">
        <h2 className="mb-3 font-bold">About page</h2>
        <p className="mb-3 text-sm text-ink-2">Your story, in your words. This fills the About page under your photo and bio.</p>
        <RichEditor value={s.aboutContent} onChange={(html) => setS((x) => ({ ...x, aboutContent: html }))} onError={(m) => show(m, 'error')} />
        <button onClick={save} className={`${btn.primary} mt-4`}>Save settings</button>
      </div>
      <Toast {...(toast || {})} />
    </>
  );
}
