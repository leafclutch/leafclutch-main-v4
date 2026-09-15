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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}