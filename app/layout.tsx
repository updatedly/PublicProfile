import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { ThemeScript } from '@/components/ThemeScript';

export const metadata: Metadata = {
  title: 'Public Profile — Ghana Accountability Tracker',
  description: 'Public Profile tracks Ghana government policies, bills, and decisions — rated, sourced, and open to public scrutiny.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
