import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '@/features/legal/LegalPage';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';

const UPDATED = '2026-09-19';

const DESCRIPTION =
  'How Leafclutch Technologies handles your information: what the website collects, who it is shared with, and how to reach us about it.';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: 'Privacy Policy | Leafclutch Technologies',
    description: DESCRIPTION,
    url: `${SITE_URL}/privacy`,
    type: 'website',
  },
};

const SECTIONS: LegalSection[] = [
  {
    heading: 'Who we are',
    body: [
      'Leafclutch Technologies Pvt. Ltd. is a software company based in Siddharthanagar (Bhairahawa), Rupandehi, Nepal. We build custom software, websites and mobile apps, run our own SaaS products, and provide IT training and design services.',
      `This policy covers ${SITE_URL} and the enquiries that reach us through it. Work we do under a signed contract is covered by that contract as well.`,
    ],
  },
  {
    heading: 'The short version',
    body: [
      'This website runs no analytics, no advertising pixels and no third-party trackers. We do not build a profile of you, and we do not sell or rent anyone’s information.',
      'The contact form does not send anything to our servers. It opens your own email app or WhatsApp with the message prepared, and nothing leaves your device until you press send there.',
    ],
  },
  {
    heading: 'Information you choose to send us',
    body: [
      'When you contact us by email, WhatsApp or phone, we receive whatever you include — typically your name, contact details and a description of what you need. We use it to answer you and to carry out work you ask us to do.',
      'If you apply for a job or internship, we receive the details and any CV you send, and use them to consider your application.',
    ],
  },
  {
    heading: 'Information collected automatically',
    body: [
      'The site is hosted on Cloudflare, which keeps standard server logs — IP address, the page requested, timestamp, browser and device type. These exist to keep the site available and to block abuse, and we do not use them to identify individual visitors.',
    ],
  },
  {
    heading: 'What we store in your browser',
    body: [
      'To make repeat visits fast and to keep the site usable on a weak connection, your browser keeps a copy of the site’s own content — text, product details and image links. This is stored only on your device, is never sent back to us, and contains nothing personal. Clearing your browser data removes it.',
      'We do not use cookies for advertising or tracking.',
    ],
  },
  {
    heading: 'Services we rely on',
    body: [
      'Running the site means a handful of other companies are involved. Each sees only what it needs to do its job:',
    ],
    list: [
      'Cloudflare — hosting and content delivery, and therefore server logs.',
      'Supabase — stores the site’s content and images.',
      'Google Fonts — serves the typefaces, which means your browser requests files from Google.',
      'Unsplash — serves some photographs used on the site.',
      'WhatsApp and your email provider — only when you choose to contact us that way.',
    ],
  },
  {
    heading: 'How long we keep things',
    body: [
      'We keep correspondence and project records for as long as we are working together and afterwards for as long as we need them for accounting, legal or reference purposes. Job applications are kept for up to one year unless you ask us to remove them sooner.',
    ],
  },
  {
    heading: 'Your choices',
    body: [
      `You can ask us what we hold about you, ask for a copy, ask us to correct it, or ask us to delete it. Write to ${CONTACT_EMAIL} and we will respond. You can also clear the site data your browser has stored at any time through your browser settings.`,
    ],
  },
  {
    heading: 'Children',
    body: [
      'This website is intended for businesses and adults. We do not knowingly collect information from children. If you believe a child has sent us personal information, contact us and we will remove it.',
    ],
  },
  {
    heading: 'Changes to this policy',
    body: [
      'If we change how we handle information, we will update this page and the date at the top. Material changes will be made clear rather than slipped in quietly.',
    ],
  },
];

export default function PrivacyRoute() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated={UPDATED}
      intro={[
        'This page explains what happens to your information when you use this website or get in touch with us. It is written to be read, not to be skimmed past.',
      ]}
      sections={SECTIONS}
    />
  );
}
