'use client';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api, refreshSite } from '@/lib/api';
import { Field, PageTitle, Panel, Toast, btn, inputCls } from '@/components/admin/ui';
import useToast from '@/components/admin/useToast';

const SWATCHES = ['#3B2A86', '#B9781B', '#C2456A', '#2F7A6B', '#4A5BA8', '#8A4FB5', '#B5532E', '#3F6E2E'];

function Row({ c, onSaved, onDelete }) {
  const [v, setV] = useState({ name: c.name, description: c.description || '', color: c.color });
  const changed = v.name !== c.name || v.description !== (c.description || '') || v.color !== c.color;
  return (
    <li className="grid gap-3 p-4 md:grid-cols-[auto_12rem_1fr_auto] md:items-center">
      <div className="flex gap-1.5">
        {SWATCHES.map((s) => (
          <button key={s} onClick={() => setV({ ...v, color: s })} aria-label={`Colour ${s}`} aria-pressed={v.color === s}
            className={`h-6 w-6 rounded-full ${v.color === s ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`} style={{ background: s }} />
        ))}
      </div>
      <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={inputCls} aria-label="Topic name" />
      <input value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} placeholder="One line about this topic" className={inputCls} aria-label="Description" />
      <div className="flex items-center gap-2">
        <span className="w-16 text-sm text-muted">{c.count} {c.count === 1 ? 'story' : 'stories'}</span>
        <button disabled={!changed} onClick={() => onSaved(c._id, v)} className={btn.ghost}>Save</button>
        <button onClick={() => onDelete(c)} className={btn.danger} aria-label={`Delete ${c.name}`}><Trash2 size={15} /></button>
      </div>
    </li>
  );
}

export default function TopicsAdmin() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', color: SWATCHES[0] });
  const [toast, show] = useToast();
  const load = () => api('/categories').then((d) => setCats(d.categories));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try { await api('/admin/categories', { method: 'POST', body: form }); setForm({ ...form, name: '', description: '' }); load(); refreshSite(); show('Topic added'); }
    catch (err) { show(err.message, 'error'); }
  };
  const update = async (id, body) => {
    try { await api(`/admin/categories/${id}`, { method: 'PUT', body }); load(); refreshSite(); show('Topic saved'); }
    catch (err) { show(err.message, 'error'); }
  };
  const remove = async (c) => {
    if (!confirm(`Delete the “${c.name}” topic? Its stories stay published without a topic.`)) return;
    await api(`/admin/categories/${c._id}`, { method: 'DELETE' }); load(); refreshSite(); show('Topic deleted');
  };

  return (
    <>
      <PageTitle title="Topics">Group stories so readers can find what they’re going through.</PageTitle>
      <Panel title="Add a topic" className="mb-6">
        <form onSubmit={create} className="grid gap-4 md:grid-cols-[14rem_1fr_auto] md:items-end">
          <Field label="Name" htmlFor="tn"><input id="tn" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Description" htmlFor="td"><input id="td" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} /></Field>
          <button className={btn.primary}>Add topic</button>
        </form>
      </Panel>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {cats.map((c) => <Row key={c._id + c.updatedAt} c={c} onSaved={update} onDelete={remove} />)}
      </ul>
      <Toast {...(toast || {})} />
    </>
  );
}
