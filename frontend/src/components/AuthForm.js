'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function AuthForm({ mode }) {
  const isLogin = mode === 'login';
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '';
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const user = isLogin ? await login(form.email, form.password) : await register(form.name, form.email, form.password);
      const dest = next && next.startsWith('/') && !next.startsWith('//') ? next : user.role === 'admin' ? '/admin' : '/';
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Can’t reach the server right now. Wait a moment and try again.' : err.message);
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const input = 'mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base focus:border-indigo focus:outline-none';
  const q = next ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:py-20">
      <h1 className="text-4xl font-extrabold tracking-[-0.03em]">{isLogin ? 'Welcome back' : 'Join the readers'}</h1>
      <p className="mt-3 font-serif text-lg text-ink-2">
        {sp.get('reason') === 'engage'
          ? 'Sign in to like and save stories. It’s free and takes a minute.'
          : isLogin ? 'Sign in to like, save and comment on stories.' : 'A free account lets you like stories, save them for later and join the comments.'}
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {!isLogin && (
          <div><label htmlFor="name" className="text-sm font-semibold">Your name</label>
            <input id="name" required value={form.name} onChange={set('name')} autoComplete="name" className={input} /></div>
        )}
        <div><label htmlFor="email" className="text-sm font-semibold">Email</label>
          <input id="email" type="email" required value={form.email} onChange={set('email')} autoComplete="email" className={input} /></div>
        <div><label htmlFor="password" className="text-sm font-semibold">Password</label>
          <input id="password" type="password" required minLength={8} value={form.password} onChange={set('password')}
            autoComplete={isLogin ? 'current-password' : 'new-password'} className={input} />
          {!isLogin && <p className="mt-1.5 text-sm text-muted">At least 8 characters.</p>}
        </div>
        {error && <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-sm font-medium text-rose">{error}</p>}
        <button disabled={busy} className="w-full rounded-full bg-indigo py-3.5 font-semibold text-on-indigo hover:bg-ink hover:text-paper disabled:opacity-60">
          {busy ? (isLogin ? 'Signing in…' : 'Creating account…') : isLogin ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-ink-2">
        {isLogin ? 'New here? ' : 'Already have an account? '}
        <Link href={`${isLogin ? '/register' : '/login'}${q}`} className="font-semibold text-indigo underline underline-offset-4">
          {isLogin ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
}
