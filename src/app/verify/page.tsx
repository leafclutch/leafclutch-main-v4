import type { Metadata } from 'next';
import VerifyPage from '@/features/verify/VerifyPage';
import { VERIFY_URL } from '@/lib/site';

const DESCRIPTION =
  'Check a credential issued by Leafclutch Technologies. Search by credential ID (LCT-2026-EMP-0001) or by name to confirm an employee, intern or student record.';

export const metadata: Metadata = {
  title: 'Verify a Credential',
  description: DESCRIPTION,
  // Canonical is the portal's own address; /verify on the main site
  // redirects here, so pointing at it would contradict the redirect.
  alternates: { canonical: VERIFY_URL },
  openGraph: {
    title: 'Verify a Credential | Leafclutch Technologies',
    description: DESCRIPTION,
    url: VERIFY_URL,
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
