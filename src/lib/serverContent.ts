import { createClient } from '@supabase/supabase-js';

/**
 * Server-side reads used for SEO: page metadata, the sitemap and JSON-LD.
 *
 * The site renders its content in the browser through AdminContext, which is
 * fine for people but leaves crawlers with an empty <head>. These helpers hit
 * Supabase directly during the server render so titles, descriptions and the
 * sitemap are correct in the initial HTML.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://leafclutchtech.com.np';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false } })
    : null;

export type ServerBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
};

/** Never let a slow or missing database break a page render. */
async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  if (!client) return fallback;
  try {
    return await run();
  } catch {
    return fallback;
  }
}

export async function getBlogPosts(): Promise<ServerBlogPost[]> {
  return safe(async () => {
    const { data, error } = await client!
      .from('blogs')
      .select('*')
      .order('published_at', { ascending: false });
    if (error || !Array.isArray(data)) return [];
    return data
      .filter(row => row.status === 'published' || row.status === 'active')
      .map(row => ({
        slug: String(row.slug ?? row.id ?? ''),
        title: String(row.title ?? ''),
        excerpt: String(row.excerpt ?? ''),
        content: String(row.content ?? ''),
        coverImage: String(row.featured_image ?? ''),
        author: String(row.author ?? 'Leafclutch Team'),
        category: String(row.category ?? row.category_id ?? ''),
        publishedAt: String(row.published_at ?? '').slice(0, 10),
        updatedAt: String(row.updated_at ?? row.published_at ?? '').slice(0, 10),
        seoTitle: String(row.seo_title ?? ''),
        seoDescription: String(row.seo_description ?? ''),
      }));
  }, []);
}

export async function getBlogPost(slug: string): Promise<ServerBlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find(p => p.slug === slug) ?? null;
}

/** Slugs for the sitemap: products, services and blog posts. */
export async function getContentSlugs() {
  return safe(async () => {
    const [products, services, posts] = await Promise.all([
      client!.from('services').select('id, updated_at'),
      client!.from('company_services').select('id, updated_at, status'),
      getBlogPosts(),
    ]);
    return {
      products: (products.data ?? []).map((r: any) => ({
        slug: String(r.id), updatedAt: String(r.updated_at ?? '').slice(0, 10),
      })),
      services: (services.data ?? [])
        .filter((r: any) => r.status !== 'draft')
        .map((r: any) => ({ slug: String(r.id), updatedAt: String(r.updated_at ?? '').slice(0, 10) })),
      posts: posts.map(p => ({ slug: p.slug, updatedAt: p.updatedAt })),
    };
  }, { products: [], services: [], posts: [] });
}

export type ServerFaq = { question: string; answer: string; category: string };

/** FAQs for FAQPage structured data — what answer engines quote. */
export async function getFaqs(): Promise<ServerFaq[]> {
  return safe(async () => {
    const { data, error } = await client!
      .from('faqs')
      .select('question, answer, category_id, status, sort_order')
      .order('sort_order', { ascending: true });
    if (error || !Array.isArray(data)) return [];
    return data
      .filter(r => r.status !== 'draft' && r.question && r.answer)
      .map(r => ({
        question: String(r.question),
        answer: String(r.answer),
        category: String(r.category_id ?? ''),
      }));
  }, []);
}
