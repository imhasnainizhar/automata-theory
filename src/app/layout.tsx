import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import { SiteChrome } from '@/components/SiteChrome';
import { Footer } from '@/components/Footer';
import { getStars } from '@/lib/github';
import { site } from '@/lib/site';

const display = Fraunces({ subsets: ['latin'], variable: '--ff-display', axes: ['SOFT', 'opsz'], style: ['normal', 'italic'] });
const sans = DM_Sans({ subsets: ['latin'], variable: '--ff-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--ff-mono' });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { title: site.name, description: site.description, type: 'website' },
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#f3ede2',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stars = await getStars();
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <SiteChrome stars={stars} />
        <div className="page">
          {children}
          <Footer stars={stars} />
        </div>
      </body>
    </html>
  );
}
