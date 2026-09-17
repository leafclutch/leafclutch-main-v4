import type { Metadata } from 'next';
import ServicesIndexPage from '@/features/services/ServicesIndexPage';

export const metadata: Metadata = {
  title: 'Our Services',
  description:
    'Software development, web development, digital marketing, SEO, UI/UX design, graphic design, video editing and professional training from Leafclutch Technologies.',
};

export default function ServicesRoute() {
  return <ServicesIndexPage />;
}
