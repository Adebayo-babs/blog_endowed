'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { shortDate } from '@/lib/format';
import { PageTitle } from '@/components/admin/ui';
import Avatar from '@/components/Avatar';

export default function ReadersAdmin() {
  const [readers, setReaders] = useState(null);
  useEffect(() => { api('/admin/readers').then((d) => setReaders(d.readers)); }, []);
  return (
    <>
      <PageTitle title="Readers">{readers ? `${readers.length} ${readers.length === 1 ? 'person has' : 'people have'} created an account.` : ' '}</PageTitle>
      {readers === null ? <p className="text-muted">Loading…</p> : readers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No reader accounts yet. Share a story to bring people in.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr><th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Email</th><th className="p-4 font-medium">Joined</th><th className="p-4 text-right font-medium">Saved stories</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {readers.map((r) => (
                <tr key={r._id}>
                  <td className="p-4"><span className="flex items-center gap-3"><Avatar name={r.name} size={32} /><span className="font-semibold">{r.name}</span></span></td>
                  <td className="p-4 text-ink-2">{r.email}</td>
                  <td className="p-4 text-ink-2">{shortDate(r.createdAt)}</td>
                  <td className="p-4 text-right tabular-nums">{r.bookmarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
