'use client';

import Link from 'next/link';
import { useAdmin } from '@/app/context/AdminContext';
import ServiceArt from '@/app/components/ui/ServiceArt';

export default function HomeServices() {
  const { companyServices } = useAdmin();

  const services = companyServices
    .filter(service => service.status === 'active')
    .sort((a, b) => a.order - b.order);

  if (services.length === 0) return null;

  return (
    <section id="our-services" className="bg-[#F8FAFC] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="section-badge">Our Services</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F1729] mt-4 leading-tight text-balance">
            Everything you need, <span className="text-[#072069]">under one roof</span>
          </h2>
          <p className="text-[#676F7E] leading-relaxed mt-4 text-balance">
            From the first line of code to the campaign that brings customers in — our teams
            cover the full journey.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <article
              key={service.id}
              className="group reveal relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/4 transition-[translate,box-shadow] duration-500 ease-out hover:shadow-xl motion-safe:hover:-translate-y-1.5"
            >
              <div className="flex h-32 items-center justify-center">
                <ServiceArt
                  serviceId={service.id}
                  icon={service.icon}
                  iconImage={service.iconImage}
                  className="h-32 w-auto transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
                />
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-[#072069] transition-colors group-hover:text-accent">
                {service.title}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#676F7E]">
                {service.shortDescription}
              </p>

              {service.features.length > 0 && (
                <ul className="mx-auto mt-6 grid w-full max-w-md grid-cols-1 gap-x-5 gap-y-2.5 text-left sm:grid-cols-2">
                  {service.features.slice(0, 4).map((feature, index) => (
                    <li key={`${feature}-${index}`} className="flex items-start gap-2">
                      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-[#3BE3A0]" aria-hidden="true">
                        <circle cx="10" cy="10" r="10" fill="currentColor" />
                        <path d="m6 10.5 2.5 2.5L14 7.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[13px] leading-snug text-[#4B5670]">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={`/services/${service.id}`}
                className="mt-auto pt-6 inline-flex items-center justify-center gap-2 self-center text-sm font-bold text-accent transition-colors"
              >
                <span className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                  Learn More
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>

              {/* Brand accent bar that fills in on hover. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-linear-to-r from-[#072069] via-[#0EA5EB] to-[#3BE3A0] transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
            </article>
          ))}
        </div>

        <div className="mt-12 text-center reveal">
          <Link
            href="/services"
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white"
          >
            View All Services <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
