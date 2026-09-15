"use client";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61584902195796",
    icon: (
      <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.67.33-1 1-1z" />
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/leafclutch.technologies/",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/leafclutch-technologies/",
    icon: (
      <>
        <path d="M6 9v9M6 6.5v.01M10 18v-5a3 3 0 016 0v5M10 9v9" />
        <path d="M10 12a3 3 0 016 0v6" />
      </>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@leafclutchtechnologies",
    icon: (
      <path d="M16.5 3c.3 1.8 1.4 3.3 3.5 3.6v3c-1.3 0-2.5-.4-3.5-1.1v6.6a5.4 5.4 0 11-5.4-5.4c.3 0 .6 0 .9.07v3.1a2.4 2.4 0 102 2.36V3h2.5z" />
    ),
  },
  {
    name: "Discord",
    href: "https://discord.gg/4aDwcMZBPq",
    icon: (
      <path d="M7.5 7.5A14 14 0 0112 6.8a14 14 0 014.5.7c1.3 1.8 2 4 2 6.5 0 2.2-1.1 3.7-3.1 4.7l-1.1-1.5M7.5 7.5a12 12 0 00-2 6.5c0 2.2 1.1 3.7 3.1 4.7l1.1-1.5M7.5 7.5c.8 1 1.4 2.2 1.7 3.5M16.5 7.5a12 12 0 00-1.7 3.5M9 14.5h.01M15 14.5h.01M9.5 16.5c1.5.7 2.5.7 5 0" />
    ),
  },
];

export default function SocialRail() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <aside className="social-rail fixed z-60 bottom-4 left-4 flex items-center gap-2 rounded-full border border-[#D9E0EA] bg-white/95 px-2.5 py-2 shadow-lg backdrop-blur md:inset-y-0 md:bottom-auto md:left-0 md:top-0 md:w-18 md:flex-col md:justify-center md:gap-4 md:rounded-none md:border-y-0 md:border-l-0 md:border-r md:px-0 md:py-6 md:shadow-none">
        <span className="hidden select-none text-[10px] font-medium uppercase tracking-[0.3em] text-[#676F7E] [writing-mode:vertical-rl] md:block">
          Follow us
        </span>
        <div className="hidden h-12 w-px bg-[#D9E0EA] md:block" />
        <div className="flex items-center gap-2 md:flex-col md:gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              aria-label={social.name}
              target="_blank"
              rel="noreferrer"
              className="social-rail-link flex h-9 w-9 items-center justify-center rounded-full border border-[#D9E0EA] text-[#676F7E] transition-all hover:border-[#072069] hover:bg-[#072069] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                {social.icon}
              </svg>
            </a>
          ))}
        </div>
      </aside>

      {/* Rendered independently (not nested in the fixed aside above) so `fixed` anchors to the viewport, letting it sit low near the bottom of the screen */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="social-scroll-link hidden select-none z-60 fixed bottom-10 left-0 w-18 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#676F7E] transition-colors hover:text-[#0EA5E9] md:flex"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 animate-bounce"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        <span className="[writing-mode:vertical-rl]">Scroll</span>
      </button>
    </>
  );
}
