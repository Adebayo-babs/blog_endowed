'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { compact, timeAgo } from '@/lib/format';
import { Panel, PageTitle, btn } from '@/components/admin/ui';

const ViewsChart = dynamic(() => import('@/components/admin/ViewsChart'), { ssr: false, loading: () => <div className="h-64" /> });

function Stat({ label, value, note }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-[-0.02em]">{value}</p>
      {note && <p className="mt-1 text-sm text-ink-2">{note}</p>}
    </div>
  );
}

export default function Overview() {
  const [days, setDays] = useState(30);
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setErr('');
    api(`/admin/stats?days=${days}`).then(setD).catch((e) => setErr(e.message));
  }, [days]);

  if (err) return <p className="text-rose">{err}</p>;
  if (!d) return <p className="text-muted">Loading your numbers…</p>;

  const { totals, period, series, topPosts, recentComments } = d;
  const change = period.previous ? Math.round(((period.views - period.previous) / period.previous) * 100) : null;
  const changeNote = change === null ? 'No earlier period to compare' : `${change >= 0 ? 'Up' : 'Down'} ${Math.abs(change)}% on the ${days} days before`;

  return (
    <>
      <PageTitle title="Overview" action={<Link href="/admin/posts/new" className={btn.primary}>Write a story</Link>}>
        How your stories are doing.
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={`Reads in the last ${days} days`} value={compact(period.views)} note={changeNote} />
        <Stat label="All-time reads" value={compact(totals.views)} note={`${totals.posts} published, ${totals.drafts} drafts`} />
        <Stat label="Readers with accounts" value={compact(totals.readers)} />
        <Stat label="Likes and comments" value={`${compact(totals.likes)} / ${compact(totals.comments)}`} />
      </div>

      <Panel className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Reads per day</h2>
          <div className="flex rounded-full bg-sunken p-1 text-sm font-semibold" role="group" aria-label="Time range">
            {[7, 30, 90].map((n) => (
              <button key={n} onClick={() => setDays(n)} aria-pressed={days === n}
                className={`rounded-full px-3.5 py-1.5 ${days === n ? 'bg-surface shadow-sm' : 'text-muted'}`}>{n} days</button>
            ))}
          </div>
        </div>
        <ViewsChart series={series} />
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Most read stories">
          {topPosts.length === 0 ? <p className="text-muted">Publish a story to see it here.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr><th className="pb-2 font-medium">Story</th><th className="pb-2 text-right font-medium">Reads</th><th className="pb-2 text-right font-medium">Likes</th><th className="pb-2 text-right font-medium">Comments</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {topPosts.map((p) => (
                    <tr key={p._id}>
                      <td className="py-3 pr-4"><Link href={`/blog/${p.slug}`} target="_blank" className="font-semibold hover:text-indigo">{p.title}</Link></td>
                      <td className="py-3 text-right tabular-nums">{p.views.toLocaleString()}</td>
                      <td className="py-3 text-right tabular-nums">{p.likesCount}</td>
                      <td className="py-3 text-right tabular-nums">{p.commentsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel title="Latest comments">
          {recentComments.length === 0 ? <p className="text-muted">No comments yet.</p> : (
            <ul className="space-y-4">
              {recentComments.map((c) => (
                <li key={c._id} className="text-sm">
                  <p><span className="font-semibold">{c.user?.name || 'Reader'}</span> <span className="text-muted">on</span>{' '}
                    <Link href={`/blog/${c.post?.slug}#comments`} target="_blank" className="font-medium text-indigo hover:underline">{c.post?.title}</Link></p>
                  <p className="mt-1 line-clamp-2 text-ink-2">{c.body}</p>
                  <p className="mt-1 text-xs text-muted">{timeAgo(c.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/comments" className="mt-5 inline-block text-sm font-semibold text-indigo hover:underline">Manage comments</Link>
        </Panel>
      </div>
    </>
  );
}
