"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/app/context/AdminContext";
import PricingSection, { tiersToPlans } from "@/app/components/ui/PricingSection";
import TestimonialSection from "@/app/components/ui/TestimonialSection";
import ProcessSection from "@/app/components/ui/ProcessSection";
import { useImageSlider } from "@/app/hooks/useImageSlider";
import { useRevealAll } from "@/app/hooks/useReveal";

const fallbackImage =
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85";

const plans = [
  {
    name: "Starter",
    price: "15,000",
    desc: "For teams getting started",
    features: [
      "Core features",
      "Basic reporting",
      "1 workspace",
      "Email support",
    ],
    notIncluded: ["Advanced analytics", "Custom integrations"],
    cta: "Get Started",
  },
  {
    name: "Professional",
    price: "35,000",
    desc: "For growing organizations",
    features: [
      "All Starter features",
      "Advanced reporting",
      "Multiple users",
      "Priority support",
    ],
    featured: true,
    cta: "Get Started",
  },
  {
    name: "Enterprise",
    price: "65,000+",
    desc: "For complex operations",
    features: [
      "All Professional features",
      "Custom workflows",
      "Advanced analytics",
      "Dedicated support",
    ],
    cta: "Contact Sales",
  },
];

function StatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#25D366]/15 text-[#0aab77]">
      {value}
    </span>
  );
}

export default function ManagedServicePage({
  serviceId,
}: {
  serviceId: string;
}) {
  const { services: managedServices } = useAdmin();
  const serviceContent = managedServices.find(
    (service) => service.id === serviceId,
  );
  const [activeFeature, setActiveFeature] = useState(0);
  const [showPricing, setShowPricing] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);
  const pageHeroImages = serviceContent
    ? [
        serviceContent.heroImage,
        ...serviceContent.images
          .filter((image) => /^Hero Image [2-4]$/i.test(image.label))
          .map((image) => image.url),
      ]
        .filter(Boolean)
        .slice(0, 4)
    : [fallbackImage];
  const { trackRef, active, goTo } = useImageSlider(pageHeroImages.length);
  const aboutImage =
    serviceContent?.images.find(
      (image) => image.label.toLowerCase() === "platform image",
    )?.url ??
    serviceContent?.images[0]?.url ??
    fallbackImage;

  useRevealAll();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (!showPricing) return;
    requestAnimationFrame(() => {
      pricingRef.current
        ?.querySelectorAll(".reveal")
        .forEach((element) => element.classList.add("visible"));
      pricingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [showPricing]);

  if (!serviceContent) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="text-3xl font-bold text-[#0F1729]">Product not found</h1>
        <p className="mt-4 text-[#676F7E]">
          This product may have been removed or is still loading.
        </p>
        <Link
          href="/"
          className="btn-navy mt-8 inline-flex rounded-xl px-6 py-3 text-sm font-semibold text-white"
        >
          Back to home
        </Link>
      </main>
    );
  }

  const features =
    serviceContent.features.length > 0
      ? serviceContent.features
      : [
          {
            id: `${serviceContent.id}-overview`,
            icon: serviceContent.icon,
            title: "Built around your needs",
            description:
              serviceContent.description ||
              "A flexible solution designed to help your team work smarter.",
            image: undefined,
          },
        ];
  const selectedFeature = features[activeFeature] ?? features[0];
  const mockRows = features
    .slice(0, 4)
    .map((feature, index) => [
      feature.title,
      "Ready",
      `${index + 1}`,
      "Active",
    ]);

  // Admin can type "example.com" or a full URL; both must produce a valid href.
  // Pricing comes from Admin > Products > Edit Product > Pricing; the standard
  // plans are used until a product defines its own.
  const pricingPlans = serviceContent.pricing?.length
    ? tiersToPlans(serviceContent.pricing)
    : plans;

  const rawProductUrl = (serviceContent.productUrl ?? "").trim();
  const productUrl = rawProductUrl
    ? /^https?:\/\//i.test(rawProductUrl)
      ? rawProductUrl
      : `https://${rawProductUrl}`
    : "";

  return (
    <div
      className="svc-page"
      style={
        {
          "--svc-accent": "#0EA5E9",
          "--svc-accent-2": "#072069",
        } as React.CSSProperties
      }
    >
      <section className="svc-hero">
        <div className="svc-hero-copy">
          {/* Product identity: logo + name, before the small label. */}
          <div className="svc-identity">
            <span className="svc-identity-icon">
              {serviceContent.iconImage ? (
                <img src={serviceContent.iconImage} alt="" />
              ) : (
                <b>{serviceContent.icon}</b>
              )}
            </span>
            <span className="svc-identity-name">{serviceContent.title}</span>
          </div>
          <span className="svc-kicker">
            {serviceContent.label || serviceContent.title.toUpperCase()}
          </span>
          <h1>{serviceContent.heading || serviceContent.title}</h1>
          <p className="svc-tagline">{serviceContent.description}</p>
          <div className="svc-actions">
            {/* <button type="button" className="svc-primary" onClick={() => setShowPricing(true)}>View Pricing <b>→</b></button> */}
            {/* Only rendered once a Product URL is set in Admin > Products. */}
            {productUrl && (
              <a
                href={productUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="svc-visit"
              >
                Visit Website
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 4h6v6" />
                  <path d="M20 4 11 13" />
                  <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
                </svg>
              </a>
            )}
            <a
              href="mailto:info@leafclutchtech.com.np"
              className="svc-secondary"
            >
              Book a Demo
            </a>
          </div>
        </div>
        <div className="svc-hero-grid">
          <aside className="svc-hero-note">
            <span className="svc-note-icon">◆</span>
            <p>
              Designed to make your everyday work simpler and more effective.
            </p>
          </aside>
          <div className="svc-hero-media">
            <div className="svc-slides" ref={trackRef}>
              {pageHeroImages.map((src, index) => (
                <img
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${serviceContent.title} ${index + 1}`}
                  draggable={false}
                />
              ))}
            </div>
            <div className="svc-hero-dots">
              {pageHeroImages.map((_, index) => (
                <span
                  key={index}
                  className={index === active ? "active" : ""}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          </div>
          <aside className="svc-hero-stat">
            <strong>{features.length}</strong>
            <span>Core features</span>
            <p>
              One connected platform
              <br />
              built for your team
            </p>
          </aside>
        </div>
      </section>

      <section className="svc-about">
        <div className="svc-about-image">
          <img src={aboutImage} alt={`${serviceContent.title} platform`} />
          <span>Built for real-world impact</span>
        </div>
        <div className="svc-about-copy">
          <span className="svc-kicker">ABOUT THE PLATFORM</span>
          <h2>
            Built for <em>better</em>
            <br />
            ways of working
          </h2>
          <p>
            {serviceContent.description ||
              `A focused platform that helps teams get more from ${serviceContent.title}.`}
          </p>
          <div className="svc-metrics">
            <b>
              {features.length}
              <small>Core features</small>
            </b>
            <b>
              1<small>Connected platform</small>
            </b>
            <b>
              24/7<small>Access</small>
            </b>
          </div>
        </div>
      </section>

      <section className="svc-items">
        <div className="svc-section-head">
          <h2>Everything in one platform</h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => setActiveFeature(index)}
              className={`px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${index === activeFeature ? "bg-(--svc-accent) text-white" : "bg-[#F3F4F7] text-[#676F7E] hover:bg-[#EBF0FA]"}`}
            >
              {feature.title}
            </button>
          ))}
        </div>
        <div className="bg-white border border-[#EBF0FA] rounded-2xl p-7 md:p-10 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="min-w-0">
            <h3 className="text-2xl md:text-[1.9rem] font-extrabold text-[#0F1729] mb-4">
              {selectedFeature.title}
            </h3>
            <p className="text-[#676F7E] leading-relaxed">
              {selectedFeature.description}
            </p>
          </div>
          <div
            className="rounded-2xl p-5 md:p-6 min-w-0"
            style={{ background: "linear-gradient(135deg, #EAF6FF, #F0FFF8)" }}
          >
            {selectedFeature.image ? (
              <img
                src={selectedFeature.image}
                alt={selectedFeature.title}
                className="aspect-video w-full rounded-xl object-cover shadow-lg"
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-[#EBF0FA] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#EBF0FA]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFC24B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3BE3A0]" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-[#676F7E] border-b border-[#EBF0FA]">
                        <th className="px-4 py-2.5 font-semibold">Feature</th>
                        <th className="px-4 py-2.5 font-semibold">Detail</th>
                        <th className="px-4 py-2.5 font-semibold">Value</th>
                        <th className="px-4 py-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(mockRows.length
                        ? mockRows
                        : [["Feature", "Ready", "1", "Active"]]
                      ).map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-[#F3F4F7] last:border-0"
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-2.5 text-[#0F1729] whitespace-nowrap"
                            >
                              {cellIndex === row.length - 1 ? (
                                <StatusBadge value={cell} />
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="svc-smarter">
        <div>
          <h2>
            Work <em>smarter</em> with {serviceContent.title}
          </h2>
          {features.slice(0, 4).map((feature) => (
            <p key={feature.id}>
              ● <span>{feature.title}</span>
            </p>
          ))}
        </div>
        <div className="svc-devices">
          <div className="svc-laptop">
            <span>● ● ●</span>
            <b>
              {serviceContent.iconImage ? (
                <img src={serviceContent.iconImage} alt="" loading="lazy" />
              ) : (
                serviceContent.icon
              )}
            </b>
          </div>
          <div className="svc-phone">✦</div>
          <i>✎</i>
          <i>◆</i>
        </div>
      </section>

      <ProcessSection
        badge="How We Work"
        title="From first call to go-live"
        subtitle={`How we roll out ${serviceContent.title} for your team.`}
      />

      <TestimonialSection service={serviceContent.title} />
      <section className="svc-cta">
        <div>
          <h2>Ready to get started?</h2>
          <p>Build a better way to work with Leafclutch.</p>
          <div className="svc-cta-actions">
            <a href="mailto:info@leafclutchtech.com.np">
              Schedule Free Demo <b>→</b>
            </a>
            <button type="button" onClick={() => setShowPricing(true)}>
              View Pricing
            </button>
          </div>
        </div>
        <div className="svc-cta-person">
          <img src={aboutImage} alt={serviceContent.title} />
          <i>✦</i>
        </div>
      </section>
      <div id="pricing" ref={pricingRef}>
        {showPricing && <PricingSection plans={pricingPlans} />}
      </div>
    </div>
  );
}
