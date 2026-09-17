/**
 * Icon set for company statistics.
 *
 * Shared by the home hero, the "Our Journey" cards and the About Us page so a
 * stat looks the same everywhere it appears.
 */
export const STAT_ICONS: { key: string; label: string }[] = [
  { key: 'users', label: 'Clients' },
  { key: 'layers', label: 'Projects' },
  { key: 'clock', label: 'Experience' },
  { key: 'shield', label: 'Uptime / Trust' },
  { key: 'team', label: 'Team' },
  { key: 'globe', label: 'Countries' },
  { key: 'star', label: 'Awards' },
  { key: 'chart', label: 'Growth' },
];

const PATHS: Record<string, React.ReactNode> = {
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  layers: (
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="16.5" cy="9" r="2.6" />
      <path d="M3 20c0-3.3 2.7-5.8 6-5.8S15 16.7 15 20" />
      <path d="M15.3 14.6c2.3.3 4.2 2.3 4.2 5.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
    </>
  ),
  star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />,
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 14 3.5-4 3 3L20 7" />
    </>
  ),
};

export default function StatIcon({
  icon,
  className = 'w-5 h-5',
}: {
  icon: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[icon] ?? PATHS.layers}
    </svg>
  );
}
