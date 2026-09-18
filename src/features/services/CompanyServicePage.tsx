'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useAdmin } from '@/app/context/AdminContext';
import { useRevealAll } from '@/app/hooks/useReveal';
import ServiceArt from '@/app/components/ui/ServiceArt';
import ProcessSection, { DEFAULT_PROCESS } from '@/app/components/ui/ProcessSection';
import PricingSection, { tiersToPlans } from '@/app/components/ui/PricingSection';

/**
 * /services/[slug] — detail page for one company service.
 *
 * Everything here comes from Admin > Our Services, so a new service added in
 * the panel gets a working page with no code change.
 */
export default function CompanyServicePage({ serviceId }: { serviceId: string }) {
  useRevealAll();
  const { companyServices } = useAdmin();
  const service = companyServices.find(item => item.id === serviceId);

  // While Supabase is still loading, the list can briefly be empty — don't 404.
  if (!service) {
    if (companyServices.length === 0) return null;
    notFound();
  }

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-linear-to-b from-[#F5F9FF] to-white pt-32 pb-14 lg:pt-40 lg:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
            <span aria-hidden="true">←</span> All Services
          </Link>
          <span className="mx-auto mt-6 flex h-45 items-center justify-center">
            <ServiceArt
              serviceId={service.id}
              icon={service.icon}
              iconImage={service.iconImage}
              className="h-45 w-auto"
            />
          </span>
          <h1 className="mt-6 text-4xl lg:text-5xl font-extrabold text-[#0F1729] leading-tight text-balance">
            {service.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#676F7E] text-balance">
            {service.shortDescription}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="mailto:info@leafclutchtech.com.np" className="btn-primary text-white px-7 py-3.5 rounded-xl text-sm font-semibold">
              Request a Quote
            </a>
            <a href="https://wa.me/9779766715768" target="_blank" rel="noreferrer" className="px-7 py-3.5 rounded-xl text-sm font-semibold border border-border bg-white text-[#072069] hover:border-accent transition-colors">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW + COVER ── */}
      {(service.fullDescription || service.coverImage) && (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            {service.fullDescription && (
              <div className="reveal">
                <span className="section-badge">Overview</span>
                <h2 className="mt-4 text-3xl font-extrabold text-[#0F1729] text-balance">
                  What you get
                </h2>
                <p className="mt-4 leading-relaxed text-[#676F7E]">{service.fullDescription}</p>
              </div>
            )}
            {service.coverImage && (
              <div className="reveal overflow-hidden rounded-2xl shadow-lg">
                <img src={service.coverImage} alt={service.title} className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      {service.features.length > 0 && (
        <section className="bg-[#F8FAFC] py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center reveal">
              <span className="section-badge">What&rsquo;s Included</span>
              <h2 className="mt-4 text-3xl font-extrabold text-[#0F1729]">Key capabilities</h2>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.features.map((feature, index) => (
                <div key={`${feature}-${index}`} className="reveal flex items-start gap-3 rounded-xl border border-border bg-white p-5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    ✓
                  </span>
                  <p className="text-sm leading-relaxed text-[#0F1729]">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BENEFITS ── */}
      {service.benefits.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center reveal">
              <span className="section-badge">Why It Matters</span>
              <h2 className="mt-4 text-3xl font-extrabold text-[#0F1729]">Business benefits</h2>
            </div>
            <ul className="mt-10 space-y-3">
              {service.benefits.map((benefit, index) => (
                <li key={`${benefit}-${index}`} className="reveal flex items-start gap-4 rounded-xl bg-[#F8FAFC] p-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#072069] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="leading-relaxed text-[#0F1729]">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── PROCESS ── steps come from Admin > Our Services, with the
           company-wide process as a fallback so the section is never empty. */}
      <ProcessSection
        steps={service.workflow?.length ? service.workflow : DEFAULT_PROCESS}
        badge="How We Work"
        title="Our process"
        subtitle={`How a ${service.title} project runs from first call to delivery.`}
      />

      {/* ── TECHNOLOGIES ── */}
      {service.technologies.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
            <span className="section-badge">Tech Stack</span>
            <h2 className="mt-4 text-3xl font-extrabold text-[#0F1729]">Technologies we use</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {service.technologies.map((tech, index) => (
                <span key={`${tech}-${index}`} className="rounded-lg border border-border bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-[#072069]">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRICING ── only when this service defines plans in the admin. ── */}
      {(service.pricing?.length ?? 0) > 0 && (
        <PricingSection plans={tiersToPlans(service.pricing ?? [])} />
      )}

      {/* ── CTA ── */}
      <section className="bg-[#072069] py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white text-balance">
            Ready to get started with {service.title}?
          </h2>
          <p className="mt-4 leading-relaxed text-white/75">
            Talk to our team and get a free consultation — no commitment required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="mailto:info@leafclutchtech.com.np" className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#072069] transition-colors hover:bg-white/90">
              Get a Free Consultation
            </a>
            <Link href="/services" className="rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Browse All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
