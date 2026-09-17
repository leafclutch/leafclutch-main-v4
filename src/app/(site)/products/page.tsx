import type { Metadata } from 'next';
import ProductsIndexPage from '@/features/products/ProductsIndexPage';

export const metadata: Metadata = {
  title: 'Our Products',
  description:
    'HRestroSewa, PragyaOS and more SaaS platforms built by Leafclutch Technologies for restaurants, hotels, schools and travel businesses.',
};

export default function ProductsRoute() {
  return <ProductsIndexPage />;
}
