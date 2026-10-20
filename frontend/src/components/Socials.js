import { Mail } from 'lucide-react';

const svg = (d) => function Icon({ size = 18 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden><path d={d} /></svg>;
};
const XIcon = svg('M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.19L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.73H5.58l11.09 14.44Z');
const Instagram = svg('M12 2.2c3.2 0 3.58.01 4.84.07 3.25.15 4.77 1.69 4.92 4.92.06 1.26.07 1.64.07 4.84s-.01 3.58-.07 4.84c-.15 3.23-1.66 4.77-4.92 4.92-1.26.06-1.64.07-4.84.07s-3.58-.01-4.84-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.18 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.84C2.42 3.92 3.94 2.37 7.16 2.22 8.42 2.21 8.8 2.2 12 2.2Zm0 4.66a5.14 5.14 0 1 0 0 10.28 5.14 5.14 0 0 0 0-10.28Zm0 8.47a3.33 3.33 0 1 1 0-6.66 3.33 3.33 0 0 1 0 6.66Zm5.34-9.87a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z');
const Facebook = svg('M13.5 21.9v-7.7h2.6l.4-3h-3v-1.9c0-.87.25-1.46 1.5-1.46h1.6V5.16a21 21 0 0 0-2.33-.12c-2.3 0-3.88 1.4-3.88 3.98v2.2H7.8v3h2.6v7.68A10 10 0 1 1 13.5 21.9Z');
const Linkedin = svg('M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z');
const Youtube = svg('M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z');

const ICONS = { instagram: Instagram, x: XIcon, facebook: Facebook, linkedin: Linkedin, youtube: Youtube, email: Mail };
const LABELS = { instagram: 'Instagram', x: 'X', facebook: 'Facebook', linkedin: 'LinkedIn', youtube: 'YouTube', email: 'Email' };

export default function Socials({ socials = {}, className = '' }) {
  const items = Object.entries(socials || {}).filter(([k, v]) => v && ICONS[k]);
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map(([k, v]) => {
        const Icon = ICONS[k];
        const href = k === 'email' && !v.startsWith('mailto:') ? `mailto:${v}` : v;
        return (
          <li key={k}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={LABELS[k]}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-2 hover:border-indigo hover:text-indigo">
              <Icon size={18} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
