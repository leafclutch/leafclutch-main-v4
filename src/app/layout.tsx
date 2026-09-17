import type { Metadata } from 'next'
import Providers from './providers'
import '../index.css'

export const metadata: Metadata = {
  title: {
    default: 'Leafclutch Technologies',
    template: '%s | Leafclutch Technologies',
  },
  description: 'Enterprise software, AI automation, and digital technology solutions.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Browser extensions (Grammarly, password managers) add attributes to
          <body> before React hydrates, which otherwise logs a mismatch warning. */}
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}