import type { Metadata } from 'next';
import ServicesIndexPage from '@/features/services/ServicesIndexPage';
import { SITE_URL } from '@/lib/serverContent';

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'Software development, website development, mobile apps, digital marketing, SEO, UI/UX design, graphic design, video editing and professional IT training from Leafclutch Technologies in Bhairahawa, Nepal.',
  alternates: { canonical: `${SITE_URL}/services` },
  openGraph: {
    title: 'Our Services | Leafclutch Technologies',
    description:
      'Software development, website development, mobile apps, digital marketing, SEO, UI/UX design, graphic design, video editing and professional IT training from Leafclutch Technologies in Bhairahawa, Nepal.',
    url: `${SITE_URL}/services`,
    type: 'website',
  },
};

export default function ServicesRoute() {
  return <ServicesIndexPage />;
}
