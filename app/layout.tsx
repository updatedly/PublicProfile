import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Public Profile — Ghana Accountability Tracker',
  description: 'Tracking government policies, officials, and institutions in Ghana. An Updatedly initiative.',
  openGraph: {
    title: 'Public Profile — Ghana Accountability Tracker',
    description: 'Transparent tracking of Ghanaian government decisions from 2020 to present.',
    url: 'https://updatedly.github.io/PublicProfile',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
