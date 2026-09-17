import type { Metadata } from 'next';
import BlogIndexPage from '@/features/blog/BlogIndexPage';
import { SITE_URL } from '@/lib/serverContent';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on software development, SaaS products, digital marketing and IT training from Leafclutch Technologies — Nepal.',
  alternates: { canonical: `${SITE_URL}/blogs` },
  openGraph: {
    title: 'Blog | Leafclutch Technologies',
    description:
      'Insights on software development, SaaS products, digital marketing and IT training from Leafclutch Technologies — Nepal.',
    url: `${SITE_URL}/blogs`,
    type: 'website',
  },
};

export default function BlogsRoute() {
  return <BlogIndexPage />;
}
