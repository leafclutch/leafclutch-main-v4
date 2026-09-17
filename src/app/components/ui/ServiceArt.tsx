'use client';

import { useState } from 'react';

/**
 * Animated illustrations that ship with the site, in /public/services.
 *
 * Plain SVG files (~1.7KB each) rather than Lottie or GIF: no player library,
 * no network fetch, and they still render on a slow connection.
 */
export const SERVICE_ILLUSTRATIONS = new Set([
  'software-development',
  'website-development',
  'digital-marketing',
  'professional-training',
  'graphic-design',
  'video-editing',
  'seo',
  'ui-ux-design',
]);

export function serviceArtSrc(serviceId: string): string | null {
  return SERVICE_ILLUSTRATIONS.has(serviceId) ? `/services/${serviceId}.svg` : null;
}

/**
 * Renders a service's illustration, falling back to its admin icon so a
 * service added later never shows a broken image.
 */
export default function ServiceArt({
  serviceId,
  icon,
  iconImage,
  className = 'h-[120px] w-auto',
  fallbackClassName = 'text-5xl',
}: {
  serviceId: string;
  icon?: string;
  iconImage?: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = serviceArtSrc(serviceId);

  if (!src || failed) {
    return (
      <span className={`flex items-center justify-center ${className} ${fallbackClassName}`} aria-hidden="true">
        {iconImage ? (
          <img src={iconImage} alt="" className="h-full w-full rounded-2xl object-cover" />
        ) : (
          icon ?? '💼'
        )}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={240}
      height={180}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
