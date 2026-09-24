"use client";

import { AppWindow, CodeXml, Layers, PenTool } from 'lucide-react'
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRevealAll } from "@/app/hooks/useReveal";
import TestimonialSection from "@/app/components/ui/TestimonialSection";
import {
  useAdmin,
  byDisplayOrder,
  type Stat,
} from "@/app/context/AdminContext";
import StatIcon from "@/app/components/ui/StatIcon";
import HomeServices from "./HomeServices";
import ProcessSection from "@/app/components/ui/ProcessSection";
const logoImg = "/Mlogo.png";

const services = [
  {
    name: "Restaurant Management",
    slug: "restaurant-management",
    desc: "POS, table management, kitchen display & real-time reports.",
    color: "#11A4D4",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
    icon: (
      <path d="M8 21h8M9 21v-5M15 21v-5M6 10a4 4 0 018-1.8A4 4 0 0118 10c0 2-1.5 3.5-3 4.2V16H9v-1.8C7.5 13.5 6 12 6 10z" />
    ),
  },
  {
    name: "Pharmacy Management",
    slug: "pharmacy-management",
    desc: "Inventory, batch tracking, expiry alerts & prescriptions.",
    color: "#25D366",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80",
    icon: (
      <>
        <rect
          x="4.5"
          y="4.5"
          width="15"
          height="15"
          rx="7.5"
          transform="rotate(45 12 12)"
        />
        <path d="M8.5 15.5l7-7" />
      </>
    ),
  },
  {
    name: "School Management",
    slug: "school-management",
    desc: "Students, exams, fees, parent portal — all in one ERP.",
    color: "#3B82F6",
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=500&q=80",
    icon: (
      <>
        <path d="M12 3L2 8l10 5 10-5-10-5z" />
        <path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" />
        <path d="M22 8v6" />
      </>
    ),
  },
  {
    name: "IT Training",
    slug: "it-training",
    desc: "Full stack, UI/UX, Django, CCNA — hands-on with experts.",
    color: "#072069",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M2 20h20" />
      </>
    ),
  },
  {
    name: "Digital Solutions",
    slug: "digital-technology",
    desc: "Web, mobile, DevOps, AI and cybersecurity services.",
    color: "#0EA5E9",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80",
    icon: (
      <>
        <path d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10z" />
        <circle cx="12" cy="10" r="2" />
        <path d="M8 16l-3 5M16 16l3 5" />
      </>
    ),
  },
  {
    name: "LMS",
    slug: "lms",
    desc: "Next-gen learning management system — launching soon.",
    color: "#3BE3A0",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=80",
    icon: (
      <>
        <path d="M3 5c2-1 5-1 7 0v14c-2-1-5-1-7 0V5z" />
        <path d="M21 5c-2-1-5-1-7 0v14c2-1 5-1 7 0V5z" />
      </>
    ),
    comingSoon: true,
  },
  {
    name: "Black Service",
    slug: "black-service",
    desc: "Placeholder service — swap in real details when this line launches.",
    color: "#000000",
    image:
      "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?auto=format&fit=crop&w=500&q=80",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      </>
    ),
    comingSoon: true,
  },
  {
    name: "ABC Service",
    slug: "abc-service",
    desc: "Placeholder service — swap in real details when this line launches.",
    color: "#3B82F6",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=500&q=80",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </>
    ),
    comingSoon: true,
  },
];

/* Positions are projected from each city's real latitude/longitude onto the
   Nepal outline's own bounding box, so the pins line up with the actual map. */
const provinceHubs = [
  {
    key: "sudurpashchim",
    province: "Sudurpashchim",
    city: "Dhangadhi",
    left: "11%",
    top: "35%",
  },
  {
    key: "karnali",
    province: "Karnali",
    city: "Surkhet",
    left: "21%",
    top: "52%",
  },
  {
    key: "gandaki",
    province: "Gandaki",
    city: "Pokhara",
    left: "48%",
    top: "55%",
  },
  {
    key: "lumbini",
    province: "Lumbini",
    city: "Siddharthanagar",
    left: "38%",
    top: "72%",
    isHq: true,
  },
  {
    key: "bagmati",
    province: "Bagmati",
    city: "Kathmandu",
    left: "65%",
    top: "67%",
  },
  {
    key: "madhesh",
    province: "Madhesh",
    city: "Janakpur",
    left: "72%",
    top: "82%",
  },
  {
    key: "koshi",
    province: "Koshi",
    city: "Biratnagar",
    left: "87%",
    top: "85%",
  },
];


/**
 * The four services the company leads with, orbiting the brand mark. The icons
 * are lucide's — the set 21st.dev builds on — so the silhouettes stay
 * consistent with one another at badge size, where a stray stroke width or a
 * mismatched corner radius is the difference between a set and a jumble.
 */
const HERO_BADGES = [
  { corner: 'tl', label: 'Web development', Icon: AppWindow, background: 'linear-gradient(145deg, #4FC3FF, #0B76C4)' },
  { corner: 'tr', label: 'Coding', Icon: CodeXml, background: 'linear-gradient(145deg, #6BE3B4, #14A874)' },
  { corner: 'bl', label: 'Graphic design', Icon: PenTool, background: 'linear-gradient(145deg, #7DA8FF, #2F5FDB)' },
  { corner: 'br', label: 'Software development', Icon: Layers, background: 'linear-gradient(145deg, #4FD9C8, #0B8E93)' },
] as const

export default function Home() {
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(true);
  const whyIntroRef = useRef<HTMLDivElement>(null);
  const aboutPanelRef = useRef<HTMLDivElement>(null);
  const achievementImageRef = useRef<HTMLDivElement>(null);
  const servicesScrollBoxRef = useRef<HTMLDivElement>(null);
  const servicePageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeService, setActiveService] = useState(0);
  const { services: managedServices, stats, clients } = useAdmin();

  // Shared company metrics, managed in Admin > Statistics. The hero bar and the
  // "Our Journey" cards both read this, so one edit updates both.
  const homeStats = stats
    .filter(
      (s) =>
        s.status === "active" && s.context !== "about" && s.context !== "nepal",
    )
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);

  // The blue "Powering Businesses Across Nepal" band — Admin > Statistics.
  // Exactly one Nepal-specific figure (the province count) leads; the other two
  // slots are the SAME shared rows the hero uses, so the numbers cannot drift
  // apart. Any extra "nepal" rows are ignored rather than shown twice.
  const byOrder = (a: Stat, b: Stat) => a.order - b.order;

  // §16 "Proud to partner with" strip — Admin > Testimonials > Partners.
  const marqueePartners = clients
    .filter((c) => c.status === "active")
    .sort((a, b) => a.order - b.order);
  const nepalStats = [
    ...stats
      .filter((s) => s.status === "active" && s.context === "nepal")
      .sort(byOrder)
      .slice(0, 1),
    ...stats
      .filter((s) => s.status === "active" && s.context === "both")
      .sort(byOrder)
      .slice(0, 2),
  ];
  const serviceCards = [...managedServices]
    .sort(byDisplayOrder)
    .map((service, index) => {
      const fallback = services.find((item) => item.slug === service.id);
      return {
        name: service.title,
        slug: service.id,
        label: service.label || fallback?.name || "Our Products",
        heading: service.heading || service.title,
        desc:
          service.description ||
          fallback?.desc ||
          "Explore this solution from Leafclutch Technologies.",
        color: fallback?.color ?? ["#0EA5E9", "#25D366", "#3B82F6"][index % 3],
        image: service.heroImage || fallback?.image || "",
        iconImage: service.iconImage || "",
        icon: fallback?.icon ?? (
          <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 9h10M7 13h7" />
          </>
        ),
        comingSoon: service.status === "coming_soon",
        // Set per product in Admin > Products > Edit Product > Product URL.
        // Falls back to the old hardcoded path when it hasn't been filled in.
        displayUrl: (service.productUrl || "").trim()
          ? (service.productUrl as string).trim().replace(/^https?:\/\//i, "")
          : `leafclutchtech.com/${service.id}`,
        productUrl: (service.productUrl || "").trim(),
      };
    });

  const scrollToServices = () => {
    document
      .getElementById("services")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const goToService = (index: number) => {
    const box = servicesScrollBoxRef.current;
    if (!box) return;
    box.scrollTo({ top: index * box.clientHeight, behavior: "smooth" });
  };

  useRevealAll();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (!isContactPopupOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsContactPopupOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isContactPopupOpen]);
  useEffect(() => {
    const section = whyIntroRef.current;
    const panel = aboutPanelRef.current;
    if (!section || !panel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          panel.classList.remove("is-visible");
          void panel.offsetWidth; // force reflow so the animation restarts every time
          panel.classList.add("is-visible");
        } else {
          panel.classList.remove("is-visible");
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const image = achievementImageRef.current;
    if (!image) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          image.classList.remove("is-visible");
          void image.offsetWidth; // force reflow so the animation restarts every time
          image.classList.add("is-visible");
        } else {
          image.classList.remove("is-visible");
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(image);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const box = servicesScrollBoxRef.current;
    const pages = servicePageRefs.current.filter(
      (page): page is HTMLDivElement => page !== null,
    );
    if (!box || !pages.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = pages.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) setActiveService(index);
          }
        });
      },
      { root: box, threshold: [0.5] },
    );
    pages.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [serviceCards.length]);
  return (
    <div className="bg-white">
      {/* ── HERO ── orbiting services scene */}
      <section className="hero2 relative overflow-hidden min-h-dvh flex flex-col justify-center">
        <div className="hero2-backdrop absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 hero-grid opacity-35" />
        </div>

        <span className="hero2-note note-a" aria-hidden="true">
          From Ideas to
          <br />
          Impact
        </span>
        <span className="hero2-note note-b" aria-hidden="true">
          Smart Solutions
          <br />
          Real Impact
        </span>
        <span className="hero2-note note-c" aria-hidden="true">
          Technology
          <br />
          for People
        </span>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4 lg:pt-20 relative z-10 w-full">
          <div className="hero2-copy">
            <div className="hero2-kicker animate-fade-up">
              <span>We Create</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
              <span>You Grow.</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
              {/* <span>Impact</span> */}
            </div>

            <h1 className="hero2-title animate-fade-up delay-100">
              Leafclutch
              <br />
              <span className="hero2-title-grad">Technologies Pvt. Ltd.</span>
            </h1>

            <p className="hero2-sub animate-fade-up delay-200">
              We Build Custom Softwares, Websites, Mobile Apps,SaaS Products,
              Provide Professional IT Training and Many more services across
              Nepal
            </p>
          </div>

          <div className="hero2-orbit-scene animate-fade-up delay-300">
            <span className="hero2-halo" />
            <span className="hero2-ring ring-outer" />
            <span className="hero2-ring ring-inner" />
            <span className="hero2-ring-spin" />
            <span className="hero2-particle p1" />
            <span className="hero2-particle p2" />
            <span className="hero2-particle p3" />
            <span className="hero2-particle p4" />
            <div className="hero2-platform" />

            <div className="hero2-globe-wrap">
              <div className="hero2-globe">
                <img
                  src="/logoF.png"
                  alt="Leafclutch Technologies"
                  className="hero2-globe-logo"
                />
              </div>

              {HERO_BADGES.map(({ corner, label, Icon, background }, index) => (
                <span
                  key={corner}
                  className={`hero2-peek-badge badge-${corner}`}
                  role="img"
                  aria-label={label}
                  /* Staggered so the four fan out one after another rather
                     than blinking in unison. */
                  style={{ background, animationDelay: `${index * 0.38}s` }}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToServices}
            className="hero2-scroll-cue"
            aria-label="Scroll down to explore products"
          >
            <span>Scroll</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="hero2-stats-wrap relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hero2-stats-bar">
              {homeStats.map((stat) => (
                <div className="hero2-stat" key={stat.id}>
                  <span className="hero2-stat-icon">
                    <StatIcon icon={stat.icon} className="w-5 h-5" />
                  </span>
                  <div>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ACHIEVEMENT STORY ── */}
      <section className="py-12 lg:py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div ref={achievementImageRef} className="achievement-image-wrap">
              <img
                src="/client.webp"
                alt="100+ happy Leafclutch clients"
                className="w-full h-auto rounded-3xl shadow-lg"
              />
            </div>

            <div className="reveal-right">
              <span className="section-badge mb-3">Since 2024</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F1729] mt-2 leading-tight">
                Our Journey Toward{" "}
                <span className="text-[#072069]">Digital Excellence</span>
              </h2>
              <p className="text-[#676F7E] text-base mt-5 max-w-lg leading-relaxed">
                From Restaurant and Hotel management systems to School ERPs and
                AI-driven automation, every solution we build reflects our
                commitment to helping businesses across Nepal operate smarter,
                grow faster and embrace technology with confidence.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                {homeStats.map((stat) => (
                  <div
                    className="bg-white rounded-2xl p-5 shadow-sm"
                    key={stat.id}
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#EEF4FF] text-[#072069] mb-3">
                      <StatIcon icon={stat.icon} className="w-4.5 h-4.5" />
                    </span>
                    <p className="text-xl font-extrabold text-[#0F1729]">
                      {stat.value}
                      {stat.unit ? ` ${stat.unit}` : ""}
                    </p>
                    <p className="text-xs text-[#676F7E] uppercase tracking-wide mt-1">
                      {stat.caption || stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── one fixed screen, scrolls up/down internally through each service */}
      <section id="services" className="pt-8 pb-6 lg:pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div className="reveal-left">
              <span className="section-badge mb-2">Our Products</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#0F1729] mt-2 leading-tight">
                Solutions built for
                <br />
                <span className="text-[#072069]">real impact</span>
              </h2>
            </div>
          </div>

          <div className="services-layout">
            <div className="services-tab-row reveal-left">
              {serviceCards.map((s, i) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => goToService(i)}
                  className={`services-tab-pill${i === activeService ? " is-active" : ""}`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div className="services-scrollbox-wrap">
              <div className="services-scrollbox" ref={servicesScrollBoxRef}>
                {serviceCards.map((s, i) => (
                  <div
                    key={s.slug}
                    ref={(el) => {
                      servicePageRefs.current[i] = el;
                    }}
                    className="services-scrollbox-page"
                  >
                    <div className="services-stage-grid">
                      <div className="services-story-copy">
                        <div className="services-story-badge-wrap">
                          <span
                            className="services-story-icon"
                            style={{
                              background: s.iconImage ? "transparent" : s.color,
                            }}
                          >
                            {s.iconImage ? (
                              <img
                                src={s.iconImage}
                                alt=""
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-5 h-5"
                              >
                                {s.icon}
                              </svg>
                            )}
                          </span>
                          {/* Product name beside the logo, not the small label. */}
                          <span className="services-story-pill">{s.name}</span>
                        </div>
                        {s.comingSoon && (
                          <span className="services-story-soon">
                            Coming Soon
                          </span>
                        )}
                        <h3 className="services-story-heading">{s.heading}</h3>
                        <p className="services-story-desc">{s.desc}</p>
                        <Link
                          href={`/products/${s.slug}`}
                          className="btn-navy font-semibold px-7 py-3.5 rounded-xl text-sm inline-flex items-center gap-2 w-fit"
                        >
                          Explore {s.name} <span aria-hidden="true">→</span>
                        </Link>
                      </div>

                      <div className="services-story-visual">
                        <div className="services-story-browser">
                          <div className="services-story-browser-bar">
                            <span className="services-story-dot dot-red" />
                            <span className="services-story-dot dot-yellow" />
                            <span className="services-story-dot dot-green" />
                            <span className="services-story-url">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-3 h-3 shrink-0"
                              >
                                <rect
                                  x="5"
                                  y="11"
                                  width="14"
                                  height="9"
                                  rx="2"
                                />
                                <path d="M8 11V7a4 4 0 018 0v4" />
                              </svg>
                              {s.displayUrl}
                            </span>
                          </div>
                          <div className="services-story-browser-body">
                            {s.image ? (
                              <img src={s.image} alt="" />
                            ) : (
                              <span className="flex h-full items-center justify-center text-6xl text-[#0F1729]/20">
                                {s.name.slice(0, 1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="services-scrollbox-dots">
                {serviceCards.map((s, i) => (
                  <button
                    key={s.slug}
                    type="button"
                    aria-label={`Show ${s.name}`}
                    className={i === activeService ? "is-active" : ""}
                    onClick={() => goToService(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section
        id="our-story"
        className="why-us-section relative overflow-hidden bg-[#F8FAFC] py-8 lg:py-10"
      >
        <div className="absolute inset-0 hero-grid opacity-22" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            ref={whyIntroRef}
            className="why-us-intro mb-20 grid items-center gap-14 lg:grid-cols-[90px_minmax(0,1fr)]"
          >
            <div className="hidden h-full flex-col items-center justify-center gap-6 lg:flex">
              <span className="why-us-vertical-label">Why work with us?</span>
              <span className="h-18 w-px bg-[#D9E0EA]" />
            </div>
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
              <div className="why-badge-scene reveal-left">
                <div className="why-badge-glow" />
                <div className="why-badge-wrap">
                  <img
                    src="/2expyear.webp"
                    alt="Leafclutch Technologies — 5 Years of Excellence"
                    className="why-badge-img"
                  />
                  <span className="why-badge-shine" aria-hidden="true" />
                </div>
              </div>
              <div ref={aboutPanelRef} className="about-slide-panel">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                  About Leafclutch
                </span>
                <h2 className="mt-5 text-3xl font-extrabold leading-tight text-white lg:text-5xl">
                  Technology that moves your business forward.
                </h2>
                <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/80 lg:text-base">
                  We combine deep engineering expertise with genuine care for
                  your business outcomes. From management systems to digital
                  transformation, we build secure, practical products that help
                  teams work smarter.
                </p>
                <div className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-white">
                  Discover more <span className="h-px w-10 bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR SERVICES ── */}
      <HomeServices />

      {/* ── OUR PROCESS ── */}
      <ProcessSection />

      {/* ── NEPAL REACH ── */}
      <section className="py-2 lg:py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="nepal-banner reveal">
            <div className="nepal-map">
              <img
                src="/map.webp"
                alt="Map of Nepal's seven provinces"
                className="nepal-map-img"
              />

              {provinceHubs.map((hub, i) => (
                <span
                  key={hub.key}
                  className={`nepal-pin${hub.isHq ? " is-hq" : ""}`}
                  style={{
                    left: hub.left,
                    top: hub.top,
                    animationDelay: `${i * 0.35}s`,
                  }}
                >
                  <span className="nepal-pin-text">
                    <strong>{hub.province}</strong>
                    <span>
                      {hub.city}
                      {hub.isHq ? " · HQ" : ""}
                    </span>
                  </span>
                  <i className="nepal-pin-dot" />
                </span>
              ))}

              <span
                className="nepal-hq-badge"
                style={{ left: "38%", top: "86%" }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M12 21c4-3 7-6.5 7-11a7 7 0 10-14 0c0 4.5 3 8 7 11z" />
                  <circle cx="12" cy="10" r="2.6" />
                </svg>
              </span>
            </div>

            <div className="nepal-copy">
              <span className="nepal-kicker">Trusted Across Nepal</span>
              <h2 className="nepal-heading">
                Powering Businesses
                <br />
                Across Nepal <em>Since 2024</em>
              </h2>
              <p className="nepal-desc">
                We build restaurant, pharmacy and school management systems,
                custom software and AI-driven automation for businesses across
                the country. From our home base in Siddharthanagar to every
                corner of Nepal, we&apos;re here to help you run smarter and
                grow faster.
              </p>

              {nepalStats.length > 0 && (
                <div className="nepal-stats">
                  {nepalStats.map((stat) => (
                    <div key={stat.id}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="nepal-quote">
                <span className="nepal-quote-mark" aria-hidden="true">
                  “
                </span>
                तपाईंको डिजिटल सफलता, हाम्रो जिम्मेवारी
                <span className="nepal-quote-mark" aria-hidden="true">
                  ”
                </span>
                <span className="nepal-quote-sub">
                  — सधैं तपाईंसँग, सधैं नेपालको लागि
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ── auto-scrolling logo marquee */}
      <section className="py-10 lg:py-12 bg-white border-t border-[#EBF0FA]">
        <p className="text-center text-xs font-bold tracking-[0.2em] uppercase text-[#7A8AA8] mb-8">
          Proud to partner with
        </p>
        <div className="logo-marquee-wrap">
          <div className="logo-marquee-track">
            {[...marqueePartners, ...marqueePartners].map((partner, i) => {
              const inner = (
                <>
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-6 w-auto max-w-24 object-contain shrink-0"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M3 21V8l9-5 9 5v13" />
                      <path d="M9 21v-6h6v6" />
                    </svg>
                  )}
                  <span>{partner.name}</span>
                </>
              );
              return partner.websiteUrl ? (
                <a
                  key={`${partner.id}-${i}`}
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="logo-marquee-item"
                >
                  {inner}
                </a>
              ) : (
                <div key={`${partner.id}-${i}`} className="logo-marquee-item">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <TestimonialSection />

      {/* ── CTA STRIP ── */}
      <section className="py-20 bg-white border-t border-[#EBF0FA]">
        <div className="max-w-5xl mx-auto px-4 text-center reveal">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-[#0F1729] leading-tight">
            Ready to build something{" "}
            <span className="text-[#072069]">extraordinary?</span>
          </h2>
          <p className="text-[#676F7E] mt-5 text-lg max-w-xl mx-auto">
            Let's talk about your project. Our team is ready to help you
            transform your vision into reality.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <a
              href="mailto:info@leafclutchtech.com.np"
              className="btn-navy px-8 py-4 rounded-xl text-sm font-semibold"
            >
              Start Your Project →
            </a>
            <button
              type="button"
              onClick={scrollToServices}
              className="btn-outline px-8 py-4 rounded-xl text-sm"
            >
              View Products
            </button>
          </div>
        </div>
      </section>

      {/* WhatsApp float */}
      <a
        href="https://wa.me/9779766715768"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <div className="whatsapp-ripple" />
        <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {isContactPopupOpen && (
        <div
          className="contact-popup-backdrop"
          role="presentation"
          onMouseDown={() => setIsContactPopupOpen(false)}
        >
          <section
            className="contact-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-popup-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="contact-popup-close"
              aria-label="Close contact popup"
              onClick={() => setIsContactPopupOpen(false)}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
              >
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
            <div className="contact-popup-copy">
              <img
                src={logoImg}
                alt="Leafclutch Technologies"
                className="contact-popup-logo"
              />
              <span className="contact-popup-kicker">Have a question?</span>
              <h2 id="contact-popup-title">
                Let’s Build
                <br />
                <em>Your Ideas</em> Together
              </h2>
              <p>
                Have questions about our products? Talk to our team and get the
                right solution for your needs.
              </p>
              <div className="contact-popup-actions">
                <a href="tel:+9779766715768" className="contact-popup-call">
                  <span aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="19"
                      height="19"
                      fill="currentColor"
                    >
                      <path d="M6.6 10.8c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z" />
                    </svg>
                  </span>
                  <strong>
                    Call Us<small>+977-9766-715768</small>
                  </strong>
                </a>
                <a
                  href="https://wa.me/9779766715768"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-popup-whatsapp"
                >
                  <span aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.06-1.33A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.22.62-1.28 1.18-1.77 1.22-.45.05-1.02.07-1.65-.1-.38-.11-.87-.28-1.5-.55-2.64-1.14-4.36-3.8-4.5-3.98-.13-.18-1.08-1.43-1.08-2.73 0-1.3.68-1.93.93-2.2.24-.26.53-.33.7-.33.18 0 .35 0 .5.01.16.01.38-.06.6.46.22.53.75 1.83.82 1.96.07.13.11.29.02.47-.09.18-.13.29-.26.45-.13.15-.27.34-.39.46-.13.13-.26.27-.11.53.15.26.66 1.09 1.42 1.77.98.87 1.8 1.14 2.06 1.27.26.13.41.11.56-.07.16-.18.65-.76.83-1.02.18-.26.35-.22.59-.13.24.09 1.53.72 1.79.85.26.13.44.2.5.31.06.11.06.62-.16 1.24z" />
                    </svg>
                  </span>
                  <strong>
                    WhatsApp Us<small>Chat with our team.</small>
                  </strong>
                </a>
              </div>
              <div className="contact-popup-benefits">
                <span>
                  ✓ <b>Quick Response</b>
                </span>
                <span>
                  ✓ <b>Expert Guidance</b>
                </span>
                <span>
                  ✓ <b>Trusted Support</b>
                </span>
                <span>
                  ✓ <b>Growing Together</b>
                </span>
              </div>
              <div className="contact-popup-cta">
                <span>
                  100% Free&nbsp; • &nbsp;No Obligation&nbsp; • &nbsp;Expert
                  Advice
                </span>
                <a href="mailto:info@leafclutchtech.com.np">
                  Book a Free Consultation <b>↗</b>
                </a>
              </div>
            </div>
            <div className="contact-popup-visual">
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85"
                alt="Support team ready to help"
              />
              <div className="contact-popup-caption">
                ♧{" "}
                <span>
                  Real People.
                  <br />
                  Real Support.
                </span>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
