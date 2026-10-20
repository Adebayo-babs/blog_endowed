'use client';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate } from '@/lib/format';

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="text-muted">{formatDate(d.day + 'T12:00:00', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
      <p className="font-semibold text-ink">{d.views.toLocaleString()} {d.views === 1 ? 'read' : 'reads'}</p>
    </div>
  );
}

/** Single series, so the panel title names it and there is no legend. */
export default function ViewsChart({ series = [] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label="Story reads per day">
      <ResponsiveContainer>
        <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--chart)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} minTickGap={28}
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            tickFormatter={(d) => formatDate(d + 'T12:00:00', { day: 'numeric', month: 'short' })} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={44} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
          <Tooltip content={<Tip />} cursor={{ stroke: 'var(--muted)', strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="views" stroke="var(--chart)" strokeWidth={2} fill="url(#viewsFill)"
            activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2, fill: 'var(--chart)' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
