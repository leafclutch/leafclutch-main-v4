import type { Metadata } from 'next';
import FaqPage from '@/features/faq/FaqPage';
import { SITE_URL, getFaqs } from '@/lib/serverContent';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about our software development process, pricing, SaaS products, IT training, internships and support — Leafclutch Technologies, Nepal.',
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: 'FAQ | Leafclutch Technologies',
    description:
      'Answers about our software development process, pricing, SaaS products, IT training, internships and support — Leafclutch Technologies, Nepal.',
    url: `${SITE_URL}/faq`,
    type: 'website',
  },
};

export default async function FaqRoute() {
  const faqs = await getFaqs();

  // FAQPage schema is what lets an answer engine quote us directly and what
  // Google uses for the expandable FAQ rich result.
  const jsonLd = faqs.length > 0 && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <FaqPage />
    </>
  );
}
