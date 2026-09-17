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
    ]
  },
}

export default nextConfig
