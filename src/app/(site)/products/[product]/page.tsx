import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ManagedServicePage from '@/features/services/ManagedServicePage';
import { getProduct, SITE_URL } from '@/lib/serverContent';

/**
 * Products that ship with the app, so a fresh database (or a slow one) does not
 * turn a valid page into a 404. Mirrors the ids in AdminContext's
 * `initialServices` — that module is client-only, so it cannot be imported here.
 */
const BUILT_IN_PRODUCTS = [
  'restaurant-management',
  'pharmacy-management',
  'school-management',
  'it-training',
  'digital-technology',
  'lms',
];

/**
 * Labels are stored as the uppercase eyebrow text the product page shows
 * ("RESTAURANT MANAGEMENT SYSTEM"). Titles should not shout, so an all-caps
 * label is converted back to title case; mixed-case labels are left alone.
 */
function titleCaseLabel(label: string): string {
  if (label !== label.toUpperCase()) return label;
  return label
    .toLowerCase()
    .replace(/\b[a-z]/g, character => character.toUpperCase());
}

/**
 * Products are edited in the admin panel and rendered from AdminContext in the
 * browser. Crawlers never run that, so the slug is resolved against Supabase
 * here: it gives the page a real title and description, lets genuinely unknown
 * slugs 404 properly instead of soft-404ing, and seeds the first paint for
 * products that only exist in the database.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string }>;
}): Promise<Metadata> {
  const { product: slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found' };

  // The root layout appends " | Leafclutch Technologies" via its title template.
  const title = product.label
    ? `${product.title} — ${titleCaseLabel(product.label)}`
    : product.title;
  const description =
    product.description ||
    `${product.title} by Leafclutch Technologies, an IT and software company in Nepal.`;
  const url = `${SITE_URL}/products/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: product.heroImage ? [{ url: product.heroImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.heroImage ? [product.heroImage] : undefined,
    },
  };
}

export default async function ProductRoute({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product: slug } = await params;
  const product = await getProduct(slug);

  // Unknown to the database and not one of the built-in products: a real 404.
  if (!product && !BUILT_IN_PRODUCTS.includes(slug)) notFound();

  const jsonLd = product && {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.title,
    description: product.description,
    image: product.heroImage || undefined,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${SITE_URL}/products/${product.slug}`,
    publisher: {
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
      <ManagedServicePage
        serviceId={slug}
        serverProduct={
          product
            ? {
                id: product.slug,
                icon: product.icon,
                iconImage: product.iconImage || undefined,
                title: product.title,
                label: product.label,
                heading: product.heading,
                description: product.description,
                heroImage: product.heroImage,
                images: [],
                features: [],
                status: product.status === 'coming_soon' ? 'coming_soon' : 'active',
                updatedAt: '',
              }
            : null
        }
      />
    </>
  );
}
