'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/app/context/AdminContext';
import { useRevealAll } from '@/app/hooks/useReveal';
import { formatBlogDate } from './blogContent';

const ALL = 'All';

export default function BlogIndexPage() {
  useRevealAll();
  const { blogPosts } = useAdmin();
  const [category, setCategory] = useState(ALL);

  const live = useMemo(
    () =>
      blogPosts
        .filter(p => p.status === 'active')
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    [blogPosts],
  );

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(live.map(p => p.category)))],
    [live],
  );

  const shown = category === ALL ? live : live.filter(p => p.category === category);
  const [lead, ...rest] = shown;

  return (
    <div className="bg-white">
      <section className="bg-linear-to-b from-[#F5F9FF] to-white pt-32 pb-12 lg:pt-40 lg:pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <span className="section-badge">Blog</span>
          <h1 className="mt-5 text-4xl lg:text-5xl font-extrabold text-[#0F1729] leading-tight text-balance">
            Notes from the team
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#676F7E] text-balance">
            What we are building, what we have learned, and how technology is changing
            business in Nepal.
          </p>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length > 2 && (
            <div className="faq-chips mb-10">
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`faq-chip${category === c ? ' is-active' : ''}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {shown.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              No posts yet. Check back soon.
            </p>
          ) : (
            <>
              {/* Lead post gets a wider, two-column treatment. */}
              {lead && (
                <Link href={`/blogs/${lead.slug}`} className="blog-lead reveal">
                  <span className="blog-lead-media">
                    {lead.coverImage ? (
                      <img src={lead.coverImage} alt="" loading="lazy" />
                    ) : (
                      <span className="blog-media-fallback" aria-hidden="true">
                        {lead.title.slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <span className="blog-lead-body">
                    <span className="blog-meta">
                      <span className="blog-tag">{lead.category}</span>
                      <time dateTime={lead.publishedAt}>{formatBlogDate(lead.publishedAt)}</time>
                      <span>· {lead.readMinutes} min read</span>
                    </span>
                    <h2>{lead.title}</h2>
                    <p>{lead.excerpt}</p>
                    <span className="blog-more">Read More <span aria-hidden="true">→</span></span>
                  </span>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map(post => (
                    <Link key={post.id} href={`/blogs/${post.slug}`} className="blog-card reveal">
                      <span className="blog-card-media">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt="" loading="lazy" />
                        ) : (
                          <span className="blog-media-fallback" aria-hidden="true">
                            {post.title.slice(0, 1)}
                          </span>
                        )}
                      </span>
                      <span className="blog-card-body">
                        <span className="blog-meta">
                          <span className="blog-tag">{post.category}</span>
                          <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                        </span>
                        <h2>{post.title}</h2>
                        <p>{post.excerpt}</p>
                        <span className="blog-more">Read More <span aria-hidden="true">→</span></span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
