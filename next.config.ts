import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
