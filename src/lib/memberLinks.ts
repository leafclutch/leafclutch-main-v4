/**
 * Contact / social links attached to a team member.
 *
 * Each link carries its own `visible` flag, so the admin can keep a URL on
 * record without showing it on the public About Us page.
 */

export type MemberLinkPlatform =
  | 'linkedin'
  | 'email'
  | 'website'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'github'
  | 'youtube'
  | 'tiktok'
  | 'whatsapp'
  | 'other';

export type MemberLink = {
  id: string;
  platform: MemberLinkPlatform;
  /** Only used when platform is 'other' — the name shown on the button. */
  label?: string;
  /** URL, email address or phone number, depending on the platform. */
  url: string;
  /** When false the link is stored but not rendered on the website. */
  visible: boolean;
};

type PlatformMeta = {
  key: MemberLinkPlatform;
  label: string;
  placeholder: string;
};

export const MEMBER_LINK_PLATFORMS: PlatformMeta[] = [
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://www.linkedin.com/in/username' },
  { key: 'email',     label: 'Email',     placeholder: 'name@leafclutchtech.com.np' },
  { key: 'website',   label: 'Website',   placeholder: 'https://example.com' },
  { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/username' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'twitter',   label: 'X (Twitter)', placeholder: 'https://x.com/username' },
  { key: 'github',    label: 'GitHub',    placeholder: 'https://github.com/username' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@channel' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@username' },
  { key: 'whatsapp',  label: 'WhatsApp',  placeholder: '9779766715768' },
  { key: 'other',     label: 'Other',     placeholder: 'https://…' },
];

const PLATFORM_KEYS = new Set<string>(MEMBER_LINK_PLATFORMS.map(p => p.key));

export function platformMeta(platform: MemberLinkPlatform): PlatformMeta {
  return MEMBER_LINK_PLATFORMS.find(p => p.key === platform) ?? MEMBER_LINK_PLATFORMS[MEMBER_LINK_PLATFORMS.length - 1];
}

/** The text shown on the button / used as the accessible name. */
export function memberLinkLabel(link: MemberLink): string {
  if (link.platform === 'other') return link.label?.trim() || 'Link';
  return platformMeta(link.platform).label;
}

/**
 * Turns the stored value into something usable in an href.
 * Emails become mailto:, WhatsApp numbers become wa.me links, and a bare
 * domain like "example.com" gets an https:// prefix so it isn't treated as
 * a relative path.
 */
export function memberLinkHref(link: MemberLink): string {
  const value = link.url.trim();
  if (!value) return '';

  if (link.platform === 'email') {
    return value.startsWith('mailto:') ? value : `mailto:${value}`;
  }

  if (link.platform === 'whatsapp') {
    if (/^https?:\/\//i.test(value)) return value;
    const digits = value.replace(/[^\d]/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }

  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  return `https://${value}`;
}

/** Links that should actually be rendered on the public site. */
export function visibleMemberLinks(links: MemberLink[] | undefined): MemberLink[] {
  return (links ?? []).filter(link => link.visible && link.url.trim() !== '');
}

let linkIdCounter = 0;
export function newMemberLinkId() {
  linkIdCounter += 1;
  return `link-${Date.now().toString(36)}-${linkIdCounter}`;
}

export function createMemberLink(platform: MemberLinkPlatform = 'linkedin'): MemberLink {
  return { id: newMemberLinkId(), platform, url: '', visible: true };
}

/**
 * Reads links off a database row.
 *
 * Rows saved before the links editor existed only have flat columns
 * (linkedin, email, website, …), so those are folded in when the `links`
 * array is absent or empty. That keeps older members working without a
 * data migration.
 */
export function normalizeMemberLinks(raw: unknown, legacy?: Record<string, unknown>): MemberLink[] {
  const parsed: MemberLink[] = [];

  if (Array.isArray(raw)) {
    raw.forEach(entry => {
      if (!entry || typeof entry !== 'object') return;
      const record = entry as Record<string, unknown>;
      const platform = String(record.platform ?? '');
      const url = String(record.url ?? '').trim();
      if (!url) return;
      parsed.push({
        id: String(record.id ?? newMemberLinkId()),
        platform: (PLATFORM_KEYS.has(platform) ? platform : 'other') as MemberLinkPlatform,
        label: record.label ? String(record.label) : undefined,
        url,
        // Anything stored before the toggle existed should stay visible.
        visible: record.visible === undefined ? true : Boolean(record.visible),
      });
    });
  }

  if (parsed.length > 0 || !legacy) return parsed;

  const LEGACY_COLUMNS: MemberLinkPlatform[] = [
    'linkedin', 'email', 'website', 'facebook', 'instagram', 'twitter', 'github',
  ];
  LEGACY_COLUMNS.forEach(platform => {
    const value = legacy[platform];
    if (typeof value === 'string' && value.trim()) {
      parsed.push({ id: newMemberLinkId(), platform, url: value.trim(), visible: true });
    }
  });

  return parsed;
}
