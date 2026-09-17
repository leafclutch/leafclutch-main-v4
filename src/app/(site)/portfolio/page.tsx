import type { Metadata } from 'next';
import PortfolioPage from '@/features/portfolio/PortfolioPage';
import { SITE_URL } from '@/lib/serverContent';

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'Software projects and SaaS platforms delivered by Leafclutch Technologies for businesses in Bhairahawa, Butwal and across Nepal, with client testimonials.',
  alternates: { canonical: `${SITE_URL}/portfolio` },
  openGraph: {
    title: 'Our Work | Leafclutch Technologies',
    description:
      'Software projects and SaaS platforms delivered by Leafclutch Technologies for businesses in Bhairahawa, Butwal and across Nepal, with client testimonials.',
    url: `${SITE_URL}/portfolio`,
    type: 'website',
  },
};

export default function PortfolioRoute() {
  return <PortfolioPage />;
}
