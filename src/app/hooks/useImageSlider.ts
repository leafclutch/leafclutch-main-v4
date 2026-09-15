'use client';

import { useEffect, useRef, useState } from 'react';

type DraggableTrack = HTMLDivElement & { __wasDragged?: () => boolean };

export function useImageSlider(count: number, autoplayMs = 1000) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current as DraggableTrack | null;
    if (!track || count === 0) return;

    const updateActive = () => {
      const nearest = Math.round(track.scrollLeft / track.clientWidth);
      setActive(nearest);
    };
    updateActive();
    track.addEventListener('scroll', updateActive, { passive: true });

    let dragging = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      dragged = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
      track.classList.add('is-dragging');
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) dragged = true;
      track.scrollLeft = startScroll - dx;
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      const nearest = Math.round(track.scrollLeft / track.clientWidth);
      track.scrollTo({ left: nearest * track.clientWidth, behavior: 'smooth' });
    };
    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    track.__wasDragged = () => dragged;

    const autoplay = setInterval(() => {
      if (dragging) return;
      const width = track.clientWidth;
      const current = Math.round(track.scrollLeft / width);
      const next = (current + 1) % count;
      track.scrollTo({ left: next * width, behavior: 'smooth' });
    }, autoplayMs);

    return () => {
      track.removeEventListener('scroll', updateActive);
      track.removeEventListener('pointerdown', onPointerDown);
      track.removeEventListener('pointermove', onPointerMove);
      track.removeEventListener('pointerup', endDrag);
      track.removeEventListener('pointercancel', endDrag);
      clearInterval(autoplay);
    };
  }, [count, autoplayMs]);

  const goTo = (index: number) => {
    const track = trackRef.current as DraggableTrack | null;
    if (track?.__wasDragged?.()) return;
    track?.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };

  return { trackRef, active, goTo };
}
