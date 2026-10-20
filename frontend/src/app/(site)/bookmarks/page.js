'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import PostRow from '@/components/PostRow';
import Empty from '@/components/Empty';
import { SignInPrompt } from '@/components/PostClient';

export default function BookmarksPage() {
  const { user, ready } = useAuth();
  const [posts, setPosts] = useState(null);
  useEffect(() => {
    if (ready && user) api('/me/bookmarks').then((d) => setPosts(d.posts)).catch(() => setPosts([]));
  }, [ready, user]);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 md:pt-16">
      <h1 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">Saved stories</h1>
      <div className="mt-6">
        {!ready ? null : !user ? (
          <SignInPrompt>to see the stories you’ve saved.</SignInPrompt>
        ) : posts === null ? (
          <p className="text-muted">Loading…</p>
        ) : posts.length === 0 ? (
          <Empty title="Nothing saved yet" action={{ href: '/blog', label: 'Find a story' }}>
            Tap Save on any story and it will wait for you here.
          </Empty>
        ) : (
          <div className="divide-y divide-line">{posts.map((p) => <PostRow key={p._id} post={p} />)}</div>
        )}
      </div>
    </div>
  );
}
