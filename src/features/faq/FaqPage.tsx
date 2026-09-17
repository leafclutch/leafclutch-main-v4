'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAdmin, FAQ_CATEGORIES } from '@/app/context/AdminContext';
import { useRevealAll } from '@/app/hooks/useReveal';

const ALL = 'All';

export default function FaqPage() {
  useRevealAll();
  const { faqs } = useAdmin();
  const [active, setActive] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const live = useMemo(
    () => faqs.filter(f => f.status === 'active').sort((a, b) => a.order - b.order),
    [faqs],
  );

  // Only offer chips for categories that actually have entries.
  const categories = useMemo(() => {
    const used = new Set(live.map(f => f.category));
    return [ALL, ...FAQ_CATEGORIES.filter(c => used.has(c))];
  }, [live]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return live.filter(f => {
      const matchesCategory = active === ALL || f.category === active;
      const matchesQuery =
        q === '' ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [live, active, query]);

  return (
    <div className="bg-white">
      <section className="bg-linear-to-b from-[#F5F9FF] to-white pt-32 pb-12 lg:pt-40 lg:pb-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <span className="section-badge">FAQ</span>
          <h1 className="mt-5 text-4xl lg:text-5xl font-extrabold text-[#0F1729] leading-tight text-balance">
            Questions, answered
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#676F7E] text-balance">
            The things people ask us most, about projects, products, training and support.
          </p>

          <div className="faq-search mt-8">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search questions…"
              aria-label="Search questions"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>
            )}
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="faq-chips reveal">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                aria-pressed={active === category}
                className={`faq-chip${active === category ? ' is-active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              No questions match that search. Try a different word, or{' '}
              <Link href="/contact" className="font-semibold text-accent hover:underline">ask us directly</Link>.
            </p>
          ) : (
            <ul className="faq-list mt-8 space-y-3">
              {shown.map(item => {
                const isOpen = openId === item.id;
                return (
                  <li key={item.id} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="faq-q"
                    >
                      <span>{item.question}</span>
                      <span className="faq-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                          <path d="M12 5v14" className="faq-icon-bar" /><path d="M5 12h14" />
                        </svg>
                      </span>
                    </button>
                    {/* Grid-rows trick animates to the answer's natural height. */}
                    <div className="faq-a">
                      <div>
                        <p>{item.answer}</p>
                        <span className="faq-cat">{item.category}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-[#F5F9FF] py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-3xl font-extrabold text-[#0F1729] text-balance">
            Still have a question?
          </h2>
          <p className="mt-4 text-[#676F7E] leading-relaxed">
            Ask us anything — we answer every message ourselves.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white">
              Contact Us <span aria-hidden="true">→</span>
            </Link>
            <a href="https://wa.me/9779766715768" target="_blank" rel="noreferrer noopener"
              className="rounded-xl border border-border bg-white px-7 py-3.5 text-sm font-semibold text-[#072069] transition-colors hover:border-accent">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
