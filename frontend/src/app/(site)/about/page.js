import { getJSON } from '@/lib/api';
import Avatar from '@/components/Avatar';
import Socials from '@/components/Socials';
import Image from 'next/image';

export const revalidate = 300;

export async function generateMetadata() {
  const s = (await getJSON('/settings'))?.settings || {};
  return { title: `About ${s.authorName || 'the writer'}`, description: s.authorBio, alternates: { canonical: '/about' } };
}

export default async function AboutPage() {
  const s = (await getJSON('/settings'))?.settings || {};
  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 md:pt-16">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_20rem]">
        <div>
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">Hi, I’m {s.authorName}.</h1>
          <p className="mt-5 font-serif text-2xl italic leading-snug text-ink-2">{s.authorBio}</p>
          <Socials socials={s.socials} className="mt-7" />
        </div>
        <div className="relative mx-auto aspect-square w-64 overflow-hidden rounded-[2rem] bg-indigo-soft md:w-full">
          {s.authorAvatar
            ? <Image src={s.authorAvatar} alt={s.authorName || ''} fill sizes="320px" className="object-cover" priority />
            : <div className="grid h-full place-items-center"><Avatar name={s.authorName} size={140} /></div>}
        </div>
      </div>
      {s.aboutContent && (
        <div className="story mx-auto mt-16" dangerouslySetInnerHTML={{ __html: s.aboutContent }} />
      )}
    </div>
  );
}
