'use client';

import Link from 'next/link';
import { useRevealAll } from '@/app/hooks/useReveal';
import { CONTACT_EMAIL } from '@/lib/site';

export type LegalSection = {
  heading: string;
  /** Paragraphs, rendered in order. */
  body?: string[];
  /** Bullet points, rendered after the paragraphs. */
  list?: string[];
};

/**
 * Shared shell for Privacy Policy and Terms of Service.
 *
 * Both are long-form text with the same structure, so the layout, type scale
 * and jump links live here and each page supplies only its content.
 */
export default function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  /** ISO date, shown so readers can tell how current this is. */
  updated: string;
  intro: string[];
  sections: LegalSection[];
}) {
  useRevealAll();

  const slug = (heading: string) =>
    heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const updatedLabel = new Date(updated).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="bg-white">
      <section className="bg-[#0F1729] hero-grid px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#3BE3A0]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            {title}
          </h1>
          <p className="mt-3 text-sm text-[#AEC0DE]">
            Last updated{' '}
            <time dateTime={updated}>{updatedLabel}</time>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {intro.map((paragraph, i) => (
          <p key={i} className="text-[#3F4A5E] leading-relaxed mb-4 text-[15px]">
            {paragraph}
          </p>
        ))}

        {/* Long documents are easier to use with a way in. */}
        <nav aria-label="On this page" className="my-10 rounded-2xl bg-[#F8FAFC] border border-border p-5">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">
            On this page
          </p>
          <ol className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {sections.map((section, i) => (
              <li key={section.heading} className="text-sm">
                <a
                  href={`#${slug(section.heading)}`}
                  className="text-[#0F1729] hover:text-accent transition-colors"
                >
                  <span className="text-muted-foreground mr-1.5">{i + 1}.</span>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {sections.map((section, i) => (
          <section key={section.heading} id={slug(section.heading)} className="scroll-mt-24 mb-9">
            <h2 className="text-lg sm:text-xl font-bold text-[#0F1729]">
              <span className="text-muted-foreground font-semibold mr-2">{i + 1}.</span>
              {section.heading}
            </h2>
            {section.body?.map((paragraph, j) => (
              <p key={j} className="mt-3 text-[#3F4A5E] leading-relaxed text-[15px]">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="mt-3 space-y-2">
                {section.list.map((item, j) => (
                  <li
                    key={j}
                    className="relative pl-5 text-[#3F4A5E] leading-relaxed text-[15px] before:absolute before:left-0 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div className="mt-12 rounded-2xl border border-border bg-[#F8FAFC] p-6">
          <h2 className="font-bold text-[#0F1729]">Questions about this page?</h2>
          <p className="mt-2 text-[15px] text-[#3F4A5E] leading-relaxed">
            Write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent font-medium hover:underline">
              {CONTACT_EMAIL}
            </a>{' '}
            and we will get back to you.
          </p>
          <Link
            href="/contact"
            className="btn-primary mt-4 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
