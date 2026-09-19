/**
 * The site's own public origin.
 *
 * Plain module with no server-only imports, so client components (share links,
 * admin previews) and server code (metadata, sitemap) can both use it.
 * Override per environment with NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://leafclutch.com.np';

/** Contact email — a different domain to the website, deliberately. */
export const CONTACT_EMAIL = 'info@leafclutch.com.np';
