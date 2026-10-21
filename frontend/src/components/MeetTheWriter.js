import Image from 'next/image';
import Link from 'next/link';
import Socials from './Socials';

const DEFAULT_PHOTOS = ['/writer/main.webp', '/writer/seated.webp'];

const DEFAULT_INTRO = `I’m a graduate student pursuing an MA in Writing at Missouri State University.

Here, I share my experiences, practical tips for writing teachers, and reflections on teaching, writing, and personal development.

Welcome to The Endowed Academy!`;

export default function MeetTheWriter({ settings = {}, first = false }) {
  const Heading = first ? 'h1' : 'h2';
  const photos = DEFAULT_PHOTOS.map((d, i) => settings.homePhotos?.[i] || d);
  const name = settings.authorName || 'Esther';
  const heading = settings.homeHeading?.trim() || `Hi, I’m ${name}.`;
  const paragraphs = (settings.homeIntro?.trim() || DEFAULT_INTRO).split(/\n\s*\n/).filter(Boolean);

  return (
    <section aria-labelledby="meet-heading" className={`mx-auto max-w-6xl px-4 sm:px-6 ${first ? 'mt-6 md:mt-10' : 'mt-16'}`}>
      <div className="grid items-center gap-12 rounded-[2.25rem] bg-indigo-soft px-6 py-12 sm:px-10 md:grid-cols-[1fr_1.1fr] md:gap-16 md:px-14 md:py-16">
        {/* Two photos, the second tucked over the first like prints on a desk */}
        <div className="relative mx-auto w-full max-w-md pb-16 pr-14 sm:pb-20 sm:pr-20">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-sunken shadow-xl shadow-indigo/15">
            <Image src={photos[0]} priority={first} alt={`${name} smiling, standing on a sunny street`} fill
              sizes="(min-width: 768px) 380px, 80vw" className="object-cover object-[50%_25%]" />
          </div>
          <div className="absolute bottom-0 right-0 aspect-[3/4] w-[52%] -rotate-[4deg] overflow-hidden rounded-[1.5rem] border-[6px] border-indigo-soft bg-sunken shadow-xl shadow-indigo/20">
            <Image src={photos[1]} priority={first} alt={`${name} smiling, seated on a bench`} fill
              sizes="(min-width: 768px) 220px, 45vw" className="object-cover object-[50%_30%]" />
          </div>
          <span aria-hidden className="absolute -left-3 top-8 h-14 w-14 rounded-full bg-marigold sm:-left-5 sm:h-16 sm:w-16" />
        </div>

        <div>
          <p className="font-serif text-xl italic text-muted">Meet the writer</p>
          <Heading id="meet-heading" className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{heading}</Heading>
          <div className="mt-6 space-y-4 font-serif text-[1.15rem] leading-[1.75] text-ink-2">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/about" className="inline-flex items-center rounded-full bg-ink px-5 py-3 font-semibold text-paper hover:bg-indigo">
              Read my story
            </Link>
            <Socials socials={settings.socials} />
          </div>
        </div>
      </div>
    </section>
  );
}
