import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeScript } from '@/components/ThemeScript';

export const metadata: Metadata = {
  title: 'Public Profile — Ghana Accountability Tracker',
  description: 'Track government policies, public officials, and institutional accountability in Ghana.',
  keywords: ['Ghana', 'accountability', 'government', 'policies', 'transparency'],
  openGraph: {
    title: 'Public Profile — Ghana Accountability Tracker',
    description: 'Track government policies and public officials in Ghana.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <div className="page-wrapper">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
