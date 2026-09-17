"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/app/context/AdminContext";

const serviceNavDefaults = [
  {
    name: "Restaurant Management",
    slug: "restaurant-management",
    desc: "Full restaurant suite",
    icon: (
      <path d="M8 21h8M9 21v-5M15 21v-5M6 10a4 4 0 018-1.8A4 4 0 0118 10c0 2-1.5 3.5-3 4.2V16H9v-1.8C7.5 13.5 6 12 6 10z" />
    ),
  },
  {
    name: "Pharmacy Management",
    slug: "pharmacy-management",
    desc: "Inventory & billing",
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
    desc: "Complete school ERP",
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
    desc: "Professional courses",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M2 20h20" />
      </>
    ),
  },
  {
    name: "Digital & Tech Solutions",
    slug: "digital-technology",
    desc: "Web, mobile & cloud",
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
    desc: "Coming soon",
    icon: (
      <>
        <path d="M3 5c2-1 5-1 7 0v14c-2-1-5-1-7 0V5z" />
        <path d="M21 5c-2-1-5-1-7 0v14c2-1 5-1 7 0V5z" />
      </>
    ),
  },
];

const careerLinks = [
  { name: "Jobs", desc: "Join our growing team", href: "/careers#jobs" },
  {
    name: "Internships",
    desc: "Start your career with us",
    href: "/careers#internships",
  },
];

const otherLinks = [
  { name: "Blogs", desc: "Ideas, news & insights", href: "/#blogs" },
  {
    name: "Verify Certificates",
    desc: "Check a Leafclutch certificate",
    href: "/#verify-certificates",
  },
  { name: "Our Projects", desc: "Work we are proud of", href: "/#projects" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [careersOpen, setCareersOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const careersRef = useRef<HTMLDivElement>(null);
  const othersRef = useRef<HTMLDivElement>(null);
  const servicesPanelRef = useRef<HTMLDivElement>(null);
  const careersPanelRef = useRef<HTMLDivElement>(null);
  const othersPanelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const openOnHover = (setOpen: (v: boolean) => void) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setServicesOpen(false);
    setCareersOpen(false);
    setOthersOpen(false);
    setOpen(true);
  };
  const closeOnLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setServicesOpen(false);
      setCareersOpen(false);
      setOthersOpen(false);
    }, 150);
  };
  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };
  const pathname = usePathname();
  const { services: managedServices } = useAdmin();
  const services = managedServices.map((service, index) => {
    const fallback = serviceNavDefaults.find(
      (item) => item.slug === service.id,
    );
    return {
      name: service.title,
      slug: service.id,
      // "Small Label (Top Text)" from Admin > Products > Edit Product.
      label: service.label || "",
      desc:
        service.description ||
        fallback?.desc ||
        "Explore this solution from Leafclutch.",
      iconImage: service.iconImage || "",
      icon: fallback?.icon ?? (
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 9h8M8 13h5" />
        </>
      ),
      order: index,
    };
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    setCareersOpen(false);
    setOthersOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !mobileMenuRef.current?.contains(target) &&
        !dropRef.current?.contains(target) &&
        !careersRef.current?.contains(target) &&
        !othersRef.current?.contains(target) &&
        !servicesPanelRef.current?.contains(target) &&
        !careersPanelRef.current?.contains(target) &&
        !othersPanelRef.current?.contains(target)
      ) {
        setServicesOpen(false);
        setCareersOpen(false);
        setOthersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b transition-all duration-300 md:left-18 ${
        scrolled && !menuOpen
          ? "-translate-y-full border-transparent"
          : "shadow-md border-[#EBF0FA]"
      }`}
    >
      <Link
        href="/"
        aria-label="Leafclutch Technologies home"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center z-10"
      >
        <img
          src="/Mlogo.png"
          alt="Leafclutch Technologies"
          className="h-12 lg:h-20 w-auto"
        />
      </Link>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          <div className="lg:hidden" aria-hidden="true" />

          <div
            className="hidden lg:flex lg:flex-1 items-center"
            aria-hidden="true"
          />

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:flex-1 items-center justify-center gap-7">
            <Link
              href="/"
              className={`nav-link font-medium text-sm text-[#0F1729] ${isActive("/") ? "active" : ""}`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`nav-link whitespace-nowrap font-medium text-sm text-[#0F1729]`}
            >
              About Us
            </Link>

            {/* Services trigger — panel renders full-width, as a sibling of the nav row */}
            <div
              className="relative"
              ref={dropRef}
              onMouseEnter={() => openOnHover(setServicesOpen)}
              onMouseLeave={closeOnLeave}
            >
              <button
                onClick={() => {
                  setServicesOpen(!servicesOpen);
                  setCareersOpen(false);
                  setOthersOpen(false);
                }}
                className={`nav-link font-medium text-sm text-[#0F1729] flex items-center gap-1 ${pathname.startsWith("/services") ? "active" : ""}`}
              >
                Products
                <svg
                  className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            <div
              className="relative"
              ref={careersRef}
              onMouseEnter={() => openOnHover(setCareersOpen)}
              onMouseLeave={closeOnLeave}
            >
              <button
                onClick={() => {
                  setCareersOpen(!careersOpen);
                  setServicesOpen(false);
                  setOthersOpen(false);
                }}
                className={`nav-link font-medium text-sm text-[#0F1729] flex items-center gap-1 ${pathname.startsWith("/careers") ? "active" : ""}`}
              >
                Careers
                <svg
                  className={`w-4 h-4 transition-transform ${careersOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <div
              className="relative"
              ref={othersRef}
              onMouseEnter={() => openOnHover(setOthersOpen)}
              onMouseLeave={closeOnLeave}
            >
              <button
                onClick={() => {
                  setOthersOpen(!othersOpen);
                  setServicesOpen(false);
                  setCareersOpen(false);
                }}
                className="nav-link font-medium text-sm text-[#0F1729] flex items-center gap-1"
              >
                Others
                <svg
                  className={`w-4 h-4 transition-transform ${othersOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="hidden lg:flex lg:flex-1 items-center justify-end gap-3">
            <a
              href="mailto:info@leafclutchtech.com.np"
              className="btn-navy text-sm font-semibold px-5 py-2.5 rounded-xl"
            >
              Contact Us
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-[#0F1729]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Full-width mega dropdowns — sibling of the row above, so they span the entire nav */}
      {servicesOpen && (
        <div
          ref={servicesPanelRef}
          className="mega-dropdown hidden lg:block"
          onMouseEnter={cancelClose}
          onMouseLeave={closeOnLeave}
        >
          <div className="mega-dropdown-inner max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/services/digital-technology"
              onClick={() => setServicesOpen(false)}
              className="mega-dropdown-eyebrow hover:text-accent transition-colors"
            >
              Products Overview →
            </Link>
            <div className="mega-dropdown-grid mega-dropdown-grid-4">
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  onClick={() => setServicesOpen(false)}
                  className="mega-dropdown-item group"
                >
                  <span className="mega-dropdown-icon">
                    {s.iconImage ? (
                      <img
                        src={s.iconImage}
                        alt=""
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        {s.icon}
                      </svg>
                    )}
                  </span>
                  <span>
                    <span className="mega-dropdown-item-name group-hover:text-accent transition-colors">
                      {s.name}
                    </span>
                    <span className="mega-dropdown-item-desc">
                      {s.label || s.desc}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {careersOpen && (
        <div
          ref={careersPanelRef}
          className="mega-dropdown hidden lg:block"
          onMouseEnter={cancelClose}
          onMouseLeave={closeOnLeave}
        >
          <div className="mega-dropdown-inner max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/careers"
              onClick={() => setCareersOpen(false)}
              className="mega-dropdown-eyebrow hover:text-accent transition-colors"
            >
              Career Opportunities →
            </Link>
            <div className="mega-dropdown-grid mega-dropdown-grid-4">
              {careerLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setCareersOpen(false)}
                  className="mega-dropdown-item group"
                >
                  <span className="mega-dropdown-icon">↗</span>
                  <span>
                    <span className="mega-dropdown-item-name group-hover:text-accent transition-colors">
                      {item.name}
                    </span>
                    <span className="mega-dropdown-item-desc">{item.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {othersOpen && (
        <div
          ref={othersPanelRef}
          className="mega-dropdown hidden lg:block"
          onMouseEnter={cancelClose}
          onMouseLeave={closeOnLeave}
        >
          <div className="mega-dropdown-inner max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="mega-dropdown-eyebrow">Explore Leafclutch →</span>
            <div className="mega-dropdown-grid mega-dropdown-grid-4">
              {otherLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOthersOpen(false)}
                  className="mega-dropdown-item group"
                >
                  <span className="mega-dropdown-icon">→</span>
                  <span>
                    <span className="mega-dropdown-item-name group-hover:text-accent transition-colors">
                      {item.name}
                    </span>
                    <span className="mega-dropdown-item-desc">{item.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden relative z-10 max-h-[calc(100vh-3.5rem)] overflow-y-auto bg-white border-t border-border shadow-xl pointer-events-auto"
        >
          <div className="px-4 py-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary"
            >
              About Us
            </Link>
            <div className="mobile-nav-group">
              <button
                type="button"
                aria-expanded={servicesOpen}
                onClick={() => setServicesOpen((open) => !open)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest"
              >
                Products
                <svg
                  className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>
              {servicesOpen && (
                <div className="mt-1 space-y-1">
                  {services.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      {s.iconImage ? (
                        <img
                          src={s.iconImage}
                          alt=""
                          className="h-4 w-4 rounded-full object-cover"
                        />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-accent"
                        >
                          {s.icon}
                        </svg>
                      )}
                      <span>{s.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="mobile-nav-group">
              <button
                type="button"
                aria-expanded={careersOpen}
                onClick={() => setCareersOpen((open) => !open)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest"
              >
                Careers
                <svg
                  className={`h-4 w-4 transition-transform ${careersOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>
              {careersOpen && (
                <div className="mt-1 space-y-1">
                  {careerLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="mobile-nav-group">
              <button
                type="button"
                aria-expanded={othersOpen}
                onClick={() => setOthersOpen((open) => !open)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest"
              >
                Others
                <svg
                  className={`h-4 w-4 transition-transform ${othersOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </button>
              {othersOpen && (
                <div className="mt-1 space-y-1">
                  {otherLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <a
              href="mailto:info@leafclutchtech.com.np"
              onClick={() => setMenuOpen(false)}
              className="block mx-3 mt-3 btn-primary text-white text-center text-sm font-semibold px-5 py-3 rounded-xl"
            >
              Contact Us
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
