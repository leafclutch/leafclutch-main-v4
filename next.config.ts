import type { NextConfig } from 'next'


/**
 * Content Security Policy.
 *
 * `unsafe-inline` for scripts is unavoidable here: Next.js inlines its
 * hydration payload, and a nonce would have to be generated per request, which
 * a prerendered page cannot do. The policy still stops an injected script from
 * loading attacker-hosted code, and `frame-ancestors`/`object-src`/`base-uri`
 * close off clickjacking, plugin content and base-tag hijacking.
 *
 * `img-src https:` is deliberately broad — image URLs are pasted into the
 * admin panel and can point anywhere, and an image is not executable.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  // `next dev` compiles modules with eval-based source maps and React Refresh,
  // so development needs 'unsafe-eval' or the whole bundle fails to evaluate.
  // The production build does not, and does not get it.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ')

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Tells browsers to refuse plain HTTP for a year. Cloudflare terminates TLS,
  // so this is safe once the custom domain is live.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      // Belt and braces with robots.txt: keep the panel out of search results
      // even if something links to it.
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
  async redirects() {
    return [
      // Training courses moved with the products they belong to.
      // Product detail pages are redirected client-side in ServiceSlugRouter,
      // because product slugs live in the database rather than in code.
      {
        source: '/services/it-training/:course',
        destination: '/products/it-training/:course',
        permanent: true,
      },
      // One canonical host: www folds into the apex so link equity and
      // analytics are not split across two domains.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.leafclutch.com.np' }],
        destination: 'https://leafclutch.com.np/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
