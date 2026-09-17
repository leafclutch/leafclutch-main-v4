import type { Metadata } from 'next';
import PortfolioPage from '@/features/portfolio/PortfolioPage';

export const metadata: Metadata = {
  title: 'Our Work',
  description:
    'Projects and platforms delivered by Leafclutch Technologies, with what our clients say about them.',
};

export default function PortfolioRoute() {
  return <PortfolioPage />;
}
