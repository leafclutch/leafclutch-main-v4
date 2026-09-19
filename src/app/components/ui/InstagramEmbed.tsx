'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Renders an Instagram post using Instagram's own embed widget.
 *
 * The widget is not cheap — it pulls in Instagram's script and then an iframe
 * per post — so nothing is requested until the embed is actually scrolled into
 * view, and the script is fetched once and shared by every embed on the page.
 */

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const SCRIPT_SRC = 'https://www.instagram.com/embed.js';
let scriptPromise: Promise<void> | null = null;

/** Loads embed.js once per page, however many embeds ask for it. */
function loadEmbedScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('blocked')));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('blocked'));
    document.body.appendChild(script);
  }).catch(reason => {
    // Let a later embed retry rather than caching the failure forever.
    scriptPromise = null;
    throw reason;
  });

  return scriptPromise;
}

export default function InstagramEmbed({
  url,
  caption,
  className = '',
}: {
  /** Canonical permalink, e.g. https://www.instagram.com/p/<code>/ */
  url: string;
  /** Used for the link text while the widget is still loading. */
  caption?: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  // Only start loading once the embed is near the viewport.
  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    loadEmbedScript()
      .then(() => {
        if (cancelled) return;
        // Turns any blockquote added since the last run into an iframe.
        window.instgrm?.Embeds.process();
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, url]);

  // Instagram's script replaces this blockquote with the real post. Until then
  // — and if the script is blocked, which ad blockers routinely do — the link
  // below is what the visitor sees, so the testimonial is never just a blank.
  return (
    <div ref={hostRef} className={`ig-embed ${className}`.trim()}>
      {visible && !failed ? (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            {caption ? `${caption} on Instagram` : 'View this post on Instagram'}
          </a>
        </blockquote>
      ) : (
        <a
          className="ig-embed-fallback"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {caption ? `${caption} on Instagram` : 'View this post on Instagram'}
        </a>
      )}
    </div>
  );
}
