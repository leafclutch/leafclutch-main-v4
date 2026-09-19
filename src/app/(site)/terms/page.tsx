import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/features/legal/LegalPage';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';

const UPDATED = '2026-09-19';

const DESCRIPTION =
  'The terms that apply when you use the Leafclutch Technologies website and when you engage us for software, training or design work.';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: 'Terms of Service | Leafclutch Technologies',
    description: DESCRIPTION,
    url: `${SITE_URL}/terms`,
    type: 'website',
  },
};

const SECTIONS: LegalSection[] = [
  {
    heading: 'Agreement to these terms',
    body: [
      `By using ${SITE_URL} you accept the terms on this page. If you do not agree with them, please do not use the site.`,
      'These terms cover the website itself. Paid work is governed by the proposal, quotation or contract we sign with you; where that document and this page disagree, the signed document wins.',
    ],
  },
  {
    heading: 'What we do',
    body: [
      'Leafclutch Technologies Pvt. Ltd. builds custom software, websites and mobile applications, operates its own SaaS products, and provides IT training, graphic design, video editing and digital marketing services from Siddharthanagar (Bhairahawa), Nepal.',
    ],
  },
  {
    heading: 'Using this website',
    body: ['You agree not to:'],
    list: [
      'Use the site for anything unlawful, or in a way that breaches someone else’s rights.',
      'Attempt to gain access to areas, accounts or systems you have not been given access to.',
      'Interfere with the site’s operation, including through automated scraping that degrades it for others.',
      'Copy substantial parts of the site to present as your own.',
    ],
  },
  {
    heading: 'Our content',
    body: [
      'The text, design, graphics, logos and software on this site belong to Leafclutch Technologies Pvt. Ltd. or to the people who licensed them to us. The Leafclutch name and logo are ours. You may read, share and link to our pages; you may not reuse our material commercially without written permission.',
      'Client names, logos and testimonials appear with permission and remain the property of those clients.',
    ],
  },
  {
    heading: 'Quotes and pricing',
    body: [
      'Prices shown on this site are indicative and are there to help you plan. The price for your project is the one in the written quotation we give you, which reflects its actual scope. We may change published pricing at any time without notice; a quotation already accepted is not affected.',
    ],
  },
  {
    heading: 'Our products',
    body: [
      'Our SaaS products — including HRestroSewa, Bhet, PragyaOS, Byapar Khata and gantabya — are provided under their own subscription terms, agreed when you sign up. This page does not replace them.',
    ],
  },
  {
    heading: 'Training and internships',
    body: [
      'Course fees, schedules and certification requirements are set out when you enrol. Certificates are issued only on completion of the stated requirements, and a certificate can be checked through our verification page.',
    ],
  },
  {
    heading: 'Links to other sites',
    body: [
      'Some pages link to sites we do not run, including Leafclutch Academy and our clients’ websites. We are not responsible for their content or their handling of your information.',
    ],
  },
  {
    heading: 'Availability',
    body: [
      'We aim to keep this site available and correct, but we do not promise it will be uninterrupted or error-free. We may change, suspend or withdraw any part of it, and we may update content without notice.',
    ],
  },
  {
    heading: 'Liability',
    body: [
      'The website is provided as it is. To the extent the law allows, we are not liable for indirect or consequential loss arising from your use of it, including lost profits or lost data. Nothing here limits liability that cannot lawfully be limited.',
    ],
  },
  {
    heading: 'Governing law',
    body: [
      'These terms are governed by the laws of Nepal, and the courts of Rupandehi have jurisdiction over any dispute arising from them.',
    ],
  },
  {
    heading: 'Changes to these terms',
    body: [
      `We may update this page. The date at the top shows when it last changed, and continuing to use the site means you accept the current version. If something here is unclear, ask us at ${CONTACT_EMAIL} rather than guessing.`,
    ],
  },
];

export default function TermsRoute() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated={UPDATED}
      intro={[
        'These terms apply when you use this website. If you engage us for a project, the agreement we sign with you sits alongside them and takes precedence for that work.',
      ]}
      sections={SECTIONS}
    />
  );
}
