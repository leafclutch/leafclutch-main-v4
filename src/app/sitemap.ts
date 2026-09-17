import type { MetadataRoute } from 'next'
import { getContentSlugs, SITE_URL } from '@/lib/serverContent'

/** Static routes, highest priority first. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/portfolio', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/blogs', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/careers', priority: 0.5, changeFrequency: 'weekly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const { products, services, posts } = await getContentSlugs()

  const dated = (value: string) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? now : date
  }

  return [
    ...STATIC_ROUTES.map(route => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...services.map(s => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: dated(s.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...products.map(p => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: dated(p.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...posts.map(p => ({
      url: `${SITE_URL}/blogs/${p.slug}`,
      lastModified: dated(p.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
