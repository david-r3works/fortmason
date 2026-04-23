import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fort Mason Landowners Association',
  description:
    'The official community portal for the Fort Mason Landowners Association. Message board, financial documents, board meeting records, and neighborhood status.',
  metadataBase: new URL('https://fortmason.info'),
  openGraph: {
    title: 'Fort Mason Landowners Association',
    description: 'The official community portal for the Fort Mason Landowners Association.',
    url: 'https://fortmason.info',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a3a5c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
