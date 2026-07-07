import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Providers } from './providers'
import { AppShell } from './AppShell'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reprman.com'
const socialImage = '/static/repr.jpg'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'ReprMan - Repertoire Management',
  description: 'ReprMan - Repertoire management web app',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ReprMan - Repertoire Management',
    description: 'ReprMan - Repertoire management web app',
    type: 'website',
    siteName: 'ReprMan',
    url: siteUrl,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: 'ReprMan app preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReprMan - Repertoire Management',
    description: 'ReprMan - Repertoire management web app',
    images: [socialImage],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ReprMan',
  url: siteUrl,
  description: 'ReprMan - Repertoire management web app',
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body>
      <script type="application/ld+json">
        {JSON.stringify(websiteJsonLd)}
      </script>
      <Providers>
        <AppShell>{children}</AppShell>
      </Providers>
    </body>
  </html>
)

export default RootLayout
