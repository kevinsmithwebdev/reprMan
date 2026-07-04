import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Providers } from './providers'
import { AppShell } from './AppShell'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReprMan - Repertoire Management',
  description: 'ReprMan - Repertoire management web app',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
