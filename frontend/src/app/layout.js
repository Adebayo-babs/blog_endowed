import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import Providers from '@/components/Providers';
import { getJSON, SITE_URL } from '@/lib/api';
import './globals.css';


export async function generateMetadata() {
  const data = await getJSON('/settings', { revalidate: 300 });
  const s = data?.settings || {};
  const name = s.siteName || 'The Endowed Academy';
  const description = s.tagline || 'Practical ideas for thinking, writing, and teaching with intention.';
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${name}: teaching strategies, writing resources and reflections`, template: `%s | ${name}` },
    description,
    openGraph: { type: 'website', siteName: name, title: name, description, url: SITE_URL, locale: 'en_US' },
    twitter: { card: 'summary_large_image', title: name, description },
    alternates: { canonical: '/' },
  };
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F3FB' },
    { media: '(prefers-color-scheme: dark)', color: '#15102A' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
