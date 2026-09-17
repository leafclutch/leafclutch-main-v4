import type { Metadata } from 'next';
import ContactPage from '@/features/contact/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Talk to Leafclutch Technologies about your project. Call, WhatsApp or send us a message — office in Siddharthanagar, Rupandehi, Nepal.',
};

export default function ContactRoute() {
  return <ContactPage />;
}
