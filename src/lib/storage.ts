/**
 * Image uploads to the Supabase `media` bucket.
 *
 * Images used to be base64-encoded straight into the row that referenced them,
 * which meant a single photo could add a few hundred kilobytes to every read of
 * that table — and, since content is cached locally, to every visitor's
 * browser storage too. Uploading to the bucket leaves only a URL behind.
 *
 * The bucket and its policies are created by supabase/2storage.sql: public
 * read, so <img src> works without a signed URL, and writes restricted to
 * signed-in users.
 */
import { supabase } from './supabase';

const BUCKET = 'media';

/** Matches the bucket's allowed_mime_types, minus the video entries. */
const ALLOWED = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

/** The bucket rejects anything larger; checked here for a clearer message. */
const MAX_BYTES = 10 * 1024 * 1024;

/** Longest edge kept after downscaling. Generous for full-width artwork. */
const MAX_EDGE = 1600;

function extensionFor(type: string) {
  if (type === 'image/svg+xml') return 'svg';
  if (type === 'image/jpeg' || type === 'image/jpg') return 'jpg';
  return type.split('/')[1] ?? 'bin';
}

/**
 * Downscales and re-encodes to WebP, which is typically several times smaller
 * than the PNG or JPEG that comes off a phone. Returns the original file when
 * it cannot help — SVG has no pixels to resample, and GIF would lose its
 * animation.
 */
async function compress(file: File): Promise<Blob> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The image could not be read.'));
    });

    const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/webp', 0.82),
    );
    // Keep whichever is smaller: re-encoding an already-tiny icon can grow it.
    return blob && blob.size < file.size ? blob : file;
  } finally {
    URL.revokeObjectURL(source);
  }
}

/**
 * Uploads an image and returns its public URL.
 *
 * `folder` groups files inside the bucket (products/, team/, blogs/ …) so the
 * Storage browser stays navigable.
 */
export async function uploadImage(file: File, folder = 'general'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (!ALLOWED.has(file.type)) {
    throw new Error('Use a JPG, PNG, WebP, GIF, SVG or AVIF image.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('That image is over 10 MB. Please use a smaller one.');
  }

  // Uploading is restricted to signed-in users by the bucket policy. Saying so
  // here is clearer than the storage error that would otherwise surface.
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error('Sign in with your admin account to upload images.');
  }

  const body = await compress(file);
  const extension = body.type === 'image/webp' ? 'webp' : extensionFor(file.type);
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'general';
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: body.type || file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    throw new Error(
      /bucket/i.test(error.message)
        ? 'The media bucket is missing. Run supabase/2storage.sql.'
        : `Upload failed: ${error.message}`,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Upload succeeded but no public URL was returned.');
  return data.publicUrl;
}

/** The `/object/public/<bucket>/` marker in a Supabase public URL. */
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`;

/** Path inside the bucket for one of our public URLs, or null for anything else. */
function bucketPath(url: string): string | null {
  const index = url.indexOf(PUBLIC_MARKER);
  if (index === -1) return null;
  const path = url.slice(index + PUBLIC_MARKER.length).split(/[?#]/)[0];
  return path ? decodeURIComponent(path) : null;
}

export function isBucketUrl(url: string): boolean {
  return bucketPath(url) !== null;
}

/**
 * Images that were swapped out in the editor and are probably now unused.
 *
 * They are not deleted at that moment: the edit may still be cancelled, in
 * which case the record goes on pointing at the original and deleting it would
 * break the image. They are removed once a save has gone through and the URL
 * is confirmed to be referenced nowhere.
 */
const replaced = new Set<string>();

export function markReplaced(url: string): void {
  if (url && isBucketUrl(url)) replaced.add(url);
}

/**
 * Deletes swapped-out images that the just-saved content no longer mentions.
 *
 * `savedContent` is the serialised state that was written, so an image still
 * in use — because the edit was abandoned, or because the same file is used in
 * two places — is kept and simply forgotten about.
 */
export async function pruneReplacedImages(savedContent: string): Promise<number> {
  if (replaced.size === 0) return 0;
  const candidates = [...replaced];
  replaced.clear();

  const unused = candidates.filter(url => !savedContent.includes(url));
  if (unused.length === 0) return 0;

  const paths = unused.map(bucketPath).filter((path): path is string => Boolean(path));
  if (paths.length === 0) return 0;

  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  // A failed clean-up leaves an unused file behind, which is harmless — never
  // worth surfacing over a save that otherwise worked.
  return error ? 0 : paths.length;
}
