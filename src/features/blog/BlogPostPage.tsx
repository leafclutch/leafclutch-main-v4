'use client';

import Link from 'next/link';
import { useAdmin } from '@/app/context/AdminContext';
import type { BlogPost } from '@/lib/blogSeed';
import { SITE_URL } from '@/lib/site';
import { useRevealAll } from '@/app/hooks/useReveal';
import { parseBlogContent, formatBlogDate } from './blogContent';

/**
 * The server passes the post it already fetched, so the article text is in the
 * initial HTML for crawlers. Context takes over once it hydrates, which keeps
 * admin edits live without another round trip.
 */
export default function BlogPostPage({
  slug,
  serverPost,
}: {
  slug: string;
  serverPost?: BlogPost | null;
}) {
  useRevealAll();
  const { blogPosts } = useAdmin();
  const post =
    blogPosts.find(p => p.slug === slug && p.status === 'active') ?? serverPost;

  // The route already 404s unknown slugs on the server; this only guards the
  // brief window before either source has the post.
  if (!post) return null;

  const blocks = parseBlogContent(post.content);
  const related = blogPosts
    .filter(p => p.status === 'active' && p.id !== post.id)
    .slice(0, 3);

  const shareUrl = `${SITE_URL}/blogs/${post.slug}`;
  const shares = [
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { name: 'X', href: `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}` },
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${shareUrl}`)}` },
  ];

  return (
    <div className="bg-white">
      <article>
        <header className="bg-linear-to-b from-[#F5F9FF] to-white pt-32 pb-10 lg:pt-40 lg:pb-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
              <span aria-hidden="true">←</span> All posts
            </Link>
            <span className="blog-meta mt-6">
              <span className="blog-tag">{post.category}</span>
              <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
              <span>· {post.readMinutes} min read</span>
            </span>
            <h1 className="mt-4 text-3xl lg:text-[2.75rem] font-extrabold leading-tight text-[#0F1729] text-balance">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#676F7E]">{post.excerpt}</p>
            <p className="mt-6 text-sm font-semibold text-[#072069]">By {post.author}</p>
          </div>
        </header>

        {post.coverImage && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="aspect-16/9 w-full rounded-2xl object-cover shadow-lg"
            />
          </div>
        )}

        <div className="blog-body max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {blocks.map((block, i) => {
            if (block.kind === 'heading') return <h2 key={i}>{block.text}</h2>;
            if (block.kind === 'list') {
              return (
                <ul key={i}>
                  {block.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              );
            }
            return <p key={i}>{block.text}</p>;
          })}

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="rounded-lg bg-[#F1F5F9] px-3 py-1.5 text-xs font-semibold text-[#4B5670]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Share this post</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {shares.map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noreferrer noopener" className="blog-share">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-[#F8FAFC] py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-[#0F1729]">Keep reading</h2>
            <div className="mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {related.map(item => (
                <Link key={item.id} href={`/blogs/${item.slug}`} className="blog-card">
                  <span className="blog-card-media">
                    {item.coverImage ? (
                      <img src={item.coverImage} alt="" loading="lazy" />
                    ) : (
                      <span className="blog-media-fallback" aria-hidden="true">{item.title.slice(0, 1)}</span>
                    )}
                  </span>
                  <span className="blog-card-body">
                    <span className="blog-meta">
                      <span className="blog-tag">{item.category}</span>
                    </span>
                    <h2>{item.title}</h2>
                    <p>{item.excerpt}</p>
                    <span className="blog-more">Read More <span aria-hidden="true">→</span></span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-[#0F1729] text-balance">
            Want something like this for your business?
          </h2>
          <p className="mt-4 text-[#676F7E] leading-relaxed">
            Tell us what you need built and we will scope it with you.
          </p>
          <Link href="/contact" className="btn-primary mt-7 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white">
            Talk to Our Team <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
