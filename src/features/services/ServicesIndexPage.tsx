'use client';

import Link from 'next/link';
import { useAdmin } from '@/app/context/AdminContext';
import { useRevealAll } from '@/app/hooks/useReveal';
import ServiceArt from '@/app/components/ui/ServiceArt';

/**
 * /services — the company's service offerings (software development, digital
 * marketing, SEO, design...). Distinct from /products, which lists the SaaS
 * platforms Leafclutch builds and sells.
 */
export default function ServicesIndexPage() {
  useRevealAll();
  const { companyServices } = useAdmin();

  const services = companyServices
    .filter(service => service.status === 'active')
    .sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-linear-to-b from-[#F5F9FF] to-white pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <span className="section-badge">Our Services</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0F1729] mt-5 leading-tight text-balance">
            Technology services that move your business forward
          </h1>
          <p className="text-[#676F7E] text-lg leading-relaxed mt-5 max-w-2xl mx-auto text-balance">
            From custom software and websites to marketing, design and training — everything
            you need to build and grow, delivered by one team.
          </p>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {services.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              Services are being updated. Please check back shortly.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group reveal flex flex-col rounded-2xl border border-border bg-white p-6 text-center shadow-sm transition-[translate,box-shadow] duration-500 ease-out hover:shadow-xl motion-safe:hover:-translate-y-1"
                >
                  <span className="flex h-[120px] items-center justify-center">
                    <ServiceArt
                      serviceId={service.id}
                      icon={service.icon}
                      iconImage={service.iconImage}
                      className="h-[120px] w-auto transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
                    />
                  </span>
                  <h2 className="mt-4 text-lg font-bold text-[#0F1729] transition-colors group-hover:text-accent">
                    {service.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#676F7E]">
                    {service.shortDescription}
                  </p>
                  <span className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-accent">
                    Learn More
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#F5F9FF] py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-3xl font-extrabold text-[#0F1729] text-balance">
            Not sure which service you need?
          </h2>
          <p className="mt-4 text-[#676F7E] leading-relaxed">
            Tell us what you are trying to achieve and we will recommend the right approach —
            no obligation.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="mailto:info@leafclutchtech.com.np" className="btn-primary text-white px-7 py-3.5 rounded-xl text-sm font-semibold">
              Talk to Our Team
            </a>
            <Link href="/products" className="px-7 py-3.5 rounded-xl text-sm font-semibold border border-border bg-white text-[#072069] hover:border-accent transition-colors">
              View Our Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
