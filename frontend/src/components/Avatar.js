import Image from 'next/image';
import { initials } from '@/lib/format';

export default function Avatar({ src, name, size = 40, className = '' }) {
  if (src) {
    return (
      <Image src={src} alt={name || ''} width={size} height={size}
        className={`shrink-0 rounded-full object-cover ${className}`} style={{ width: size, height: size }} />
    );
  }
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-indigo text-on-indigo font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}
