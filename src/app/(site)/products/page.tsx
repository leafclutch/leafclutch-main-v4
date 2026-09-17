import type { Metadata } from 'next';
import ProductsIndexPage from '@/features/products/ProductsIndexPage';
import { SITE_URL } from '@/lib/serverContent';

export const metadata: Metadata = {
  title: 'Our Products',
  description:
    'HRestroSewa restaurant management, PragyaOS school management, Bhet customer loyalty and more SaaS products built in Nepal by Leafclutch Technologies.',
  alternates: { canonical: `${SITE_URL}/products` },
  openGraph: {
    title: 'Our Products | Leafclutch Technologies',
    description:
      'HRestroSewa restaurant management, PragyaOS school management, Bhet customer loyalty and more SaaS products built in Nepal by Leafclutch Technologies.',
    url: `${SITE_URL}/products`,
    type: 'website',
  },
};

export default function ProductsRoute() {
  return <ProductsIndexPage />;
}
