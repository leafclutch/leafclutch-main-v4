import type { Metadata } from 'next';
import FaqPage from '@/features/faq/FaqPage';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about Leafclutch Technologies — services, SaaS products, training, internships, pricing and support.',
};

export default function FaqRoute() {
  return <FaqPage />;
}
