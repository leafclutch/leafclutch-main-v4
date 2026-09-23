import type { Metadata } from 'next';
import VerifyPage from '@/features/verify/VerifyPage';
import { SITE_URL } from '@/lib/site';

const DESCRIPTION =
  'Check a credential issued by Leafclutch Technologies. Search by credential ID (LCT-2026-EMP-0001) or by name to confirm an employee, intern or student record.';

export const metadata: Metadata = {
  title: 'Verify a Credential',
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/verify` },
  openGraph: {
    title: 'Verify a Credential | Leafclutch Technologies',
    description: DESCRIPTION,
    url: `${SITE_URL}/verify`,
    type: 'website',
  },
};

/**
 * Lives outside the (site) group: the verification portal is served on its own
 * subdomain and stands alone, without the marketing navigation and footer.
 */
export default function VerifyRoute() {
  return <VerifyPage />;
}
