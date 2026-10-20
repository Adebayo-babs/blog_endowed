import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getJSON } from '@/lib/api';

export default async function SiteLayout({ children }) {
  const data = await getJSON('/settings', { revalidate: 300 });
  const settings = data?.settings || {};
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <Header siteName={settings.siteName} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
