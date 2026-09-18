import type { Metadata } from 'next';
import ServiceSlugRouter from '@/features/services/ServiceSlugRouter';
import { getCompanyService, getProduct, SITE_URL } from '@/lib/serverContent';

/**
 * Service pages render from AdminContext in the browser, so the slug is
 * resolved against Supabase here to give crawlers a real title, description
 * and canonical URL. Product slugs still live under /services for old links;
 * those canonicalise to their /products/ home so the two do not compete.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: slug } = await params;

  const companyService = await getCompanyService(slug);
  if (companyService) {
    // The root layout appends " | Leafclutch Technologies" via its title template.
    const title = companyService.title;
    const description =
      companyService.shortDescription ||
      `${companyService.title} from Leafclutch Technologies, an IT and software company in Nepal.`;
    const url = `${SITE_URL}/services/${companyService.slug}`;
    const image = companyService.coverImage || undefined;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  }

  // Legacy /services/<product> URL: point search engines at the real page.
  const product = await getProduct(slug);
  if (product) {
    return {
      title: product.title,
      description: product.description,
      alternates: { canonical: `${SITE_URL}/products/${product.slug}` },
    };
  }

  return { title: 'Service not found' };
}

export default async function ServiceRoute({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const companyService = await getCompanyService(service);

  const jsonLd = companyService && {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: companyService.title,
    description:
      companyService.shortDescription || companyService.fullDescription,
    image: companyService.coverImage || undefined,
    serviceType: companyService.title,
    areaServed: ['Bhairahawa', 'Butwal', 'Kathmandu', 'Pokhara', 'Nepal'],
    url: `${SITE_URL}/services/${companyService.slug}`,
    provider: {
      '@type': 'Organization',
      name: 'Leafclutch Technologies Pvt. Ltd.',
      url: SITE_URL,
    },
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ServiceSlugRouter slug={service} />
    </>
  );
}
