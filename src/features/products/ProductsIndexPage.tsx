'use client';

import Link from 'next/link';
import { useAdmin, byDisplayOrder } from '@/app/context/AdminContext';
import { useRevealAll } from '@/app/hooks/useReveal';

/**
 * /products — the SaaS platforms Leafclutch builds and sells (HRestroSewa,
 * PragyaOS, ...). Distinct from /services, which lists what the team does for
 * clients. Both are driven from the admin panel.
 */
export default function ProductsIndexPage() {
  useRevealAll();
  const { services: products } = useAdmin();

  // AdminService.status is only 'active' | 'coming_soon' — both are public.
  const live = [...products].sort(byDisplayOrder);

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-linear-to-b from-[#F5F9FF] to-white pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <span className="section-badge">Our Products</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0F1729] mt-5 leading-tight text-balance">
            Software platforms built for real businesses
          </h1>
          <p className="text-[#676F7E] text-lg leading-relaxed mt-5 max-w-2xl mx-auto text-balance">
            Ready-to-use systems for restaurants, hotels, schools and more — built in Nepal,
            running in production today.
          </p>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {live.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              Products are being updated. Please check back shortly.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {live.map(product => (
                <article
                  key={product.id}
                  className="group reveal flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-[translate,box-shadow] duration-500 ease-out hover:shadow-xl motion-safe:hover:-translate-y-1"
                >
                  <div className="aspect-16/10 overflow-hidden bg-secondary">
                    {product.heroImage ? (
                      <img
                        src={product.heroImage}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-5xl text-[#0F1729]/15">
                        {product.title.slice(0, 1)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white text-lg">
                        {product.iconImage
                          ? <img src={product.iconImage} alt="" className="h-full w-full object-cover" />
                          : product.icon}
                      </span>
                      <h2 className="text-lg font-bold text-[#0F1729] transition-colors group-hover:text-accent">
                        {product.title}
                      </h2>
                      {product.status === 'coming_soon' && (
                        <span className="ml-auto shrink-0 rounded-full bg-[#3BE3A0]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0aab77]">
                          Soon
                        </span>
                      )}
                    </div>

                    {product.label && (
                      <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-accent">
                        {product.label}
                      </p>
                    )}
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#676F7E]">
                      {product.description}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <Link href={`/products/${product.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                        View Product
                        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                      {product.productUrl && (
                        <a
                          href={/^https?:\/\//i.test(product.productUrl) ? product.productUrl : `https://${product.productUrl}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#072069] hover:text-accent transition-colors"
                        >
                          Visit Site
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M14 4h6v6" /><path d="M20 4 11 13" />
                            <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#F5F9FF] py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-3xl font-extrabold text-[#0F1729] text-balance">
            Need something built for your business?
          </h2>
          <p className="mt-4 text-[#676F7E] leading-relaxed">
            We build custom software too. Tell us your requirements and we will scope it with you.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="mailto:info@leafclutch.com.np" className="btn-primary text-white px-7 py-3.5 rounded-xl text-sm font-semibold">
              Book a Free Demo
            </a>
            <Link href="/services" className="px-7 py-3.5 rounded-xl text-sm font-semibold border border-border bg-white text-[#072069] hover:border-accent transition-colors">
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
