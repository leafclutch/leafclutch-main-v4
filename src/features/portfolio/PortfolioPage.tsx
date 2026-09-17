'use client';

import Link from 'next/link';
import { useAdmin, type Project } from '@/app/context/AdminContext';
import { useRevealAll } from '@/app/hooks/useReveal';

function ProjectCard({ project }: { project: Project }) {
  const href = project.url
    ? /^https?:\/\//i.test(project.url) ? project.url : `https://${project.url}`
    : '';

  return (
    <article className="work-card reveal">
      <div className="work-media">
        {project.image ? (
          <img src={project.image} alt={project.company} loading="lazy" decoding="async" />
        ) : (
          <span className="work-media-fallback" aria-hidden="true">
            {project.company.slice(0, 1).toUpperCase()}
          </span>
        )}
        {project.category && <span className="work-tag">{project.category}</span>}
      </div>

      <div className="work-body">
        <h2 className="work-title">{project.company}</h2>
        {project.description && <p className="work-desc">{project.description}</p>}

        {project.testimonial && (
          <blockquote className="work-quote">
            <svg viewBox="0 0 24 24" className="work-quote-mark" aria-hidden="true">
              <path d="M9 11H6.5A2.5 2.5 0 0 1 4 8.5v-1A2.5 2.5 0 0 1 6.5 5H8a2 2 0 0 1 2 2v6c0 3-1.5 5-4 6M19 11h-2.5A2.5 2.5 0 0 1 14 8.5v-1A2.5 2.5 0 0 1 16.5 5H18a2 2 0 0 1 2 2v6c0 3-1.5 5-4 6"
                fill="currentColor" />
            </svg>
            <p>{project.testimonial}</p>
            {project.testimonialAuthor && <cite>— {project.testimonialAuthor}</cite>}
          </blockquote>
        )}

        {href && (
          <a href={href} target="_blank" rel="noreferrer noopener" className="work-visit">
            <span>Visit Site</span>
            <span className="work-visit-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h13" /><path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function PortfolioPage() {
  useRevealAll();
  const { projects } = useAdmin();
  const live = projects
    .filter(p => p.status === 'active')
    .sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white">
      <section className="bg-linear-to-b from-[#F5F9FF] to-white pt-32 pb-14 lg:pt-40 lg:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <span className="section-badge">Our Work</span>
          <h1 className="mt-5 text-4xl lg:text-5xl font-extrabold text-[#0F1729] leading-tight text-balance">
            Work we&rsquo;re proud to put our name on
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#676F7E] text-balance">
            Real platforms running real businesses — and what the people using them say.
          </p>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {live.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              Projects are being updated. Please check back shortly.
            </p>
          ) : (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {live.map(project => <ProjectCard key={project.id} project={project} />)}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#F5F9FF] py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-3xl font-extrabold text-[#0F1729] text-balance">
            Want your project on this page?
          </h2>
          <p className="mt-4 text-[#676F7E] leading-relaxed">
            Tell us what you need built and we will scope it with you — no obligation.
          </p>
          <Link href="/contact" className="btn-primary mt-7 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white">
            Start Your Project <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
