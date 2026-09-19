import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostPage from '@/features/blog/BlogPostPage';
import { INITIAL_BLOG_SLUGS } from '@/lib/blogSeed';
import { getBlogPost, SITE_URL } from '@/lib/serverContent';
import { jsonLd as toJsonLd } from '@/lib/jsonLd';

/**
 * Metadata is resolved on the server so crawlers and link previews get a real
 * title, description and image — the page body itself hydrates client-side.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Post not found' };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = `${SITE_URL}/blogs/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  // 404 on the server for genuinely unknown slugs — the built-in posts are
  // valid even before they have been saved to the database.
  if (!post && !INITIAL_BLOG_SLUGS.includes(slug)) notFound();

  // Article structured data, so the post can qualify as a rich result.
  const jsonLd = post && {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Leafclutch Technologies Pvt. Ltd.',
      url: SITE_URL,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blogs/${post.slug}` },
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }}
        />
      )}
      <BlogPostPage
        slug={slug}
        serverPost={
          post
            ? {
                id: post.slug,
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                coverImage: post.coverImage,
                author: post.author,
                category: post.category,
                tags: [],
                publishedAt: post.publishedAt,
                readMinutes: Math.max(1, Math.round(post.content.split(/\s+/).length / 200)),
                seoTitle: post.seoTitle,
                seoDescription: post.seoDescription,
                order: 0,
                status: 'active',
                updatedAt: post.updatedAt,
              }
            : null
        }
      />
    </>
  );
}
