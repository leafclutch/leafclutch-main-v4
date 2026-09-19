/**
 * Instagram post links used in place of uploaded testimonial images.
 *
 * Uploads are stored as base64 inside the row itself, so a single photo can add
 * a few hundred kilobytes to every read of the testimonials table. A permalink
 * is a few dozen characters and the picture is served by Instagram.
 */

/** Matches /p/, /reel/, /reels/ and the older /tv/ permalinks. */
const POST_PATH = /^\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/;

/**
 * Reduces anything someone might paste — a share link with tracking
 * parameters, an embed snippet, a link without a scheme — to the canonical
 * permalink Instagram's embed script expects. Returns null when the input is
 * not an Instagram post.
 */
export function normalizeInstagramUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // Accept a pasted <blockquote> embed snippet by pulling the permalink out.
  const fromSnippet = raw.match(/data-instgrm-permalink=["']([^"']+)["']/);
  const candidate = fromSnippet ? fromSnippet[1] : raw;

  let url: URL;
  try {
    url = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '');
  if (host !== 'instagram.com' && !host.endsWith('.instagram.com')) return null;

  const match = url.pathname.match(POST_PATH);
  if (!match) return null;

  // Tracking parameters (igsh, utm_*) are dropped: they change nothing about
  // which post is shown and would otherwise be stored forever.
  return `https://www.instagram.com/p/${match[1]}/`;
}

export function isInstagramUrl(input: string): boolean {
  return normalizeInstagramUrl(input) !== null;
}
