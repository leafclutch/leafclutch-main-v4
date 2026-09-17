import type { Metadata } from 'next';
import ContactPage from '@/features/contact/ContactPage';
import { SITE_URL } from '@/lib/serverContent';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Talk to Leafclutch Technologies about your project. Office in Siddharthanagar (Bhairahawa), Rupandehi, Nepal — call, WhatsApp or send a message.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: 'Contact Us | Leafclutch Technologies',
    description:
      'Talk to Leafclutch Technologies about your project. Office in Siddharthanagar (Bhairahawa), Rupandehi, Nepal — call, WhatsApp or send a message.',
    url: `${SITE_URL}/contact`,
    type: 'website',
  },
};

export default function ContactRoute() {
  return <ContactPage />;
}
