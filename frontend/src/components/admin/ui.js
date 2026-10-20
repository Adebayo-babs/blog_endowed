'use client';
export const inputCls = 'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.95rem] focus:border-indigo focus:outline-none';
export const btn = {
  primary: 'inline-flex items-center justify-center gap-2 rounded-full bg-indigo px-5 py-2.5 text-sm font-semibold text-on-indigo hover:bg-ink hover:text-paper disabled:opacity-50',
  dark: 'inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-indigo disabled:opacity-50',
  ghost: 'inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-indigo disabled:opacity-50',
  danger: 'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-rose hover:bg-rose/10',
};

export function PageTitle({ title, children, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-[-0.025em]">{title}</h1>
        {children && <p className="mt-1.5 text-ink-2">{children}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, hint, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>
      {title && <h2 className="mb-4 font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function Toast({ message, tone = 'ok' }) {
  if (!message) return null;
  return (
    <div role="status" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg ${tone === 'error' ? 'bg-rose text-white' : 'bg-ink text-paper'}`}>
      {message}
    </div>
  );
}
