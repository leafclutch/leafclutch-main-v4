/**
 * The site's own public origin.
 *
 * Plain module with no server-only imports, so client components (share links,
 * admin previews) and server code (metadata, sitemap) can both use it.
 * Override per environment with NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://leafclutch.com.np';

/**
 * The credential portal's own origin. It is served by this same app through a
 * host rewrite, but it is the canonical address for anything verification
 * related, and /verify on the main site redirects here.
 */
export const VERIFY_URL =
  process.env.NEXT_PUBLIC_VERIFY_URL?.replace(/\/$/, '') || 'https://verify.leafclutch.com.np';

/** Contact email — a different domain to the website, deliberately. */
export const CONTACT_EMAIL = 'info@leafclutch.com.np';
