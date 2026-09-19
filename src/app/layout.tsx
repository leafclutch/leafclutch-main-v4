import type { Metadata } from 'next'
import Providers from './providers'
import { SITE_URL } from '@/lib/serverContent'
import '../index.css'
import { jsonLd } from '@/lib/jsonLd';

const DESCRIPTION =
  'Leafclutch Technologies is an IT and software company in Bhairahawa (Siddharthanagar), Nepal — custom software development, websites, mobile apps, SaaS products, digital marketing, SEO and professional IT training.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Leafclutch Technologies — IT & Software Company in Nepal',
    template: '%s | Leafclutch Technologies',
  },
  description: DESCRIPTION,
  applicationName: 'Leafclutch Technologies',
  // Keywords carry little weight with Google, but some answer engines and
  // regional crawlers still read them.
  keywords: [
    'Leafclutch Technologies', 'Leafclutch', 'IT company in Nepal',
    'best IT company in Nepal', 'software company in Nepal',
    'IT company in Bhairahawa', 'IT company in Butwal',
    'software company in Bhairahawa', 'software company in Butwal',
    'web development Nepal', 'mobile app development Nepal',
    'SaaS company Nepal', 'custom software development Nepal',
    'digital marketing agency Nepal', 'SEO services Nepal',
    'UI UX design Nepal', 'IT training in Bhairahawa',
    'restaurant management software Nepal', 'school management software Nepal',
    'HRestroSewa', 'PragyaOS', 'Bhet',
  ],
  authors: [{ name: 'Leafclutch Technologies Pvt. Ltd.', url: SITE_URL }],
  creator: 'Leafclutch Technologies Pvt. Ltd.',
  publisher: 'Leafclutch Technologies Pvt. Ltd.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    siteName: 'Leafclutch Technologies',
    title: 'Leafclutch Technologies — IT & Software Company in Nepal',
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en_NP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leafclutch Technologies — IT & Software Company in Nepal',
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'technology',
}

/**
 * Organisation + LocalBusiness + WebSite schema.
 *
 * LocalBusiness with a real address and areaServed is what makes "IT company
 * in Bhairahawa" style searches resolvable; the WebSite node lets search
 * engines understand the site as a whole.
 */
const organisationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'],
      '@id': `${SITE_URL}/#organization`,
      name: 'Leafclutch Technologies Pvt. Ltd.',
      alternateName: ['Leafclutch', 'Leafclutch Technologies'],
      url: SITE_URL,
      logo: `${SITE_URL}/footer.png`,
      image: `${SITE_URL}/footer.png`,
      description: DESCRIPTION,
      email: 'info@leafclutch.com.np',
      telephone: '+977-9766715768',
      foundingDate: '2024',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Siddharthanagar',
        addressLocality: 'Siddharthanagar (Bhairahawa)',
        addressRegion: 'Lumbini Province',
        addressCountry: 'NP',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 27.5019, longitude: 83.4506 },
      areaServed: [
        { '@type': 'Country', name: 'Nepal' },
        { '@type': 'City', name: 'Bhairahawa' },
        { '@type': 'City', name: 'Butwal' },
        { '@type': 'City', name: 'Kathmandu' },
        { '@type': 'City', name: 'Pokhara' },
      ],
      knowsAbout: [
        'Custom software development', 'Web development', 'Mobile app development',
        'SaaS products', 'Digital marketing', 'Search engine optimization',
        'UI/UX design', 'Graphic design', 'Video editing', 'IT training',
      ],
      sameAs: [
        'https://www.facebook.com/profile.php?id=61584902195796',
        'https://www.instagram.com/leafclutch.technologies/',
        'https://www.linkedin.com/company/leafclutch-technologies/',
        'https://www.tiktok.com/@leafclutchtechnologies',
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Leafclutch Technologies',
      description: DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en',
    },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organisationSchema) }}
        />
      </head>
      {/* Browser extensions (Grammarly, password managers) add attributes to
          <body> before React hydrates, which otherwise logs a mismatch warning. */}
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
