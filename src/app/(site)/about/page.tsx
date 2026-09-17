import type { Metadata } from 'next';
import AboutPage from '@/features/about/AboutPage';
import { SITE_URL } from '@/lib/serverContent';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Leafclutch Technologies is an IT and software company in Bhairahawa (Siddharthanagar), Rupandehi, Nepal. Meet the team building software, SaaS products and digital services for businesses across Nepal.',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About Us | Leafclutch Technologies',
    description:
      'Leafclutch Technologies is an IT and software company in Bhairahawa (Siddharthanagar), Rupandehi, Nepal. Meet the team building software, SaaS products and digital services for businesses across Nepal.',
    url: `${SITE_URL}/about`,
    type: 'website',
  },
};

export default function AboutRoute() {
  return <AboutPage />;
}
