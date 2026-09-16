type IconProps = { className?: string };

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function IconDashboard({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

export function IconProducts({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} className={className}>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

export function IconTestimonials({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} className={className}>
      <path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
    </svg>
  );
}

export function IconImages({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8.5" cy="9" r="1.7" />
      <path d="M21 15l-5.5-5.5L5 20" />
    </svg>
  );
}

export function IconMembers({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.3 2.5-5.8 6.5-5.8S15.5 16.7 15.5 20" />
      <circle cx="17" cy="8.6" r="2.4" />
      <path d="M15.7 14.3c2.5.3 4.3 2.3 4.3 5.7" />
    </svg>
  );
}

export function IconSettings({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

export function IconLock({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} className={className}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M7.5 10.5V7a4.5 4.5 0 019 0v3.5" />
    </svg>
  );
}

export function IconSearch({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconCheckCircle({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5.4" />
    </svg>
  );
}

export function IconChevronDown({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={2.4} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconChevronRight({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={2.4} className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
