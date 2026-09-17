import type { MemberLinkPlatform } from '@/lib/memberLinks';

/**
 * One inline SVG per link platform, drawn on a 24x24 grid so they all sit at
 * the same optical weight next to each other.
 */
const PATHS: Record<MemberLinkPlatform, React.ReactNode> = {
  linkedin: (
    <>
      <path d="M6 9v9" />
      <path d="M6 6.01V6" />
      <path d="M10 18v-5.5a3 3 0 0 1 6 0V18" />
      <path d="M10 9v9" />
    </>
  ),
  email: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3.5 7 7.4 5.3a2 2 0 0 0 2.2 0L20.5 7" />
    </>
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
    </>
  ),
  facebook: <path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5H17L17.5 11H14.5V9a.5.5 0 0 1 .5-.5Z" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M17.2 6.8v.01" />
    </>
  ),
  twitter: <path d="M4 4h3.8l4.5 6 5-6H21l-6.7 8L21 20h-3.8l-4.7-6.3L7.2 20H4l7-8.3Z" />,
  github: (
    <>
      <path d="M9.5 20.5c-4 1.2-4-2.3-5.5-2.8" />
      <path d="M15 21v-3.3a2.9 2.9 0 0 0-.8-2.2c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4 9.6c0 4.6 2.8 5.6 5.5 6a2.9 2.9 0 0 0-.8 2.1V21" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.5 9.5 5 2.5-5 2.5Z" />
    </>
  ),
  tiktok: (
    <>
      <path d="M15 3v10.8a3.7 3.7 0 1 1-3-3.6" />
      <path d="M15 6.2A4.8 4.8 0 0 0 19.5 9" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5 4.8 16A8 8 0 1 1 8 19.2Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1l-1.4-.9-1 .8a5.6 5.6 0 0 1-2.5-2.5l.8-1L10.5 9c-.5 0-1.5.1-1.5.5Z" />
    </>
  ),
  other: (
    <>
      <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
      <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
    </>
  ),
};

export default function SocialIcon({
  platform,
  className = 'h-4 w-4',
}: {
  platform: MemberLinkPlatform;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[platform] ?? PATHS.other}
    </svg>
  );
}
