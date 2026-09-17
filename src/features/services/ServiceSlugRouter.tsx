'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useAdmin } from '@/app/context/AdminContext';
import CompanyServicePage from './CompanyServicePage';

/**
 * Resolves /services/[slug].
 *
 * Products used to live under /services, so any slug that is a product gets
 * forwarded to its new /products/ home rather than 404ing. Existing links,
 * bookmarks and search results keep working.
 */
export default function ServiceSlugRouter({ slug }: { slug: string }) {
  const router = useRouter();
  const { companyServices, services: products } = useAdmin();

  const isCompanyService = companyServices.some(s => s.id === slug);
  const isProduct = products.some(p => p.id === slug);

  useEffect(() => {
    if (!isCompanyService && isProduct) router.replace(`/products/${slug}`);
  }, [isCompanyService, isProduct, router, slug]);

  if (isCompanyService) return <CompanyServicePage serviceId={slug} />;

  // Redirecting, or the admin data hasn't loaded yet.
  if (isProduct || companyServices.length === 0) return null;

  notFound();
}
