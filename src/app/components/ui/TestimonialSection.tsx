'use client';

import { useEffect, useRef, useState } from 'react';
import { useAdmin } from '@/app/context/AdminContext';
import { useReveal } from '@/app/hooks/useReveal';

interface Props {
  service?: string;
}

function initialsOf(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function TestimonialSection({ service }: Props) {
  const { testimonials } = useAdmin();
  const headerRef = useReveal();

  const published = testimonials.filter(t => t.status !== 'draft');
  const filtered = service
    ? published.filter(t => t.service === service || t.service === 'General')
    : published;

  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const positionRef = useRef(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || filtered.length === 0) return;
    positionRef.current = 0;
    const count = filtered.length;
    const clamp = (v: number) => Math.min(Math.max(v, 0), count - 1);

    const paint = () => {
      const pos = positionRef.current;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const delta = i - pos;
        const dist = Math.min(Math.abs(delta), 3);
        const focus = Math.max(0, 1 - Math.abs(delta));
        card.style.setProperty('--focus', String(focus));
        card.style.transform = `translate(-50%, -50%) translateX(${delta * 210}px) translateZ(${-dist * 150}px) rotateY(${delta * -24}deg) scale(${1 - dist * 0.16})`;
        card.style.opacity = String(Math.max(0.12, 1 - dist * 0.4));
        card.style.zIndex = String(1000 - Math.round(Math.abs(delta) * 10));
      });
      const nearest = clamp(Math.round(pos));
      setActive(prev => (prev === nearest ? prev : nearest));
    };

    const animateTo = (target: number) => {
      positionRef.current = clamp(target);
      stage.classList.remove('is-dragging');
      paint();
    };

    paint();

    let dragging = false;
    let dragged = false;
    let startX = 0;
    let startPos = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      dragged = false;
      startX = e.clientX;
      startPos = positionRef.current;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('is-dragging');
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      stage.style.setProperty('--pointer-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) dragged = true;
      positionRef.current = clamp(startPos - dx / 130);
      paint();
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      animateTo(Math.round(positionRef.current));
    };

    let wheelTimer: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      stage.classList.add('is-dragging');
      positionRef.current = clamp(positionRef.current + e.deltaY / 140);
      paint();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => animateTo(Math.round(positionRef.current)), 140);
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', paint);

    (stage as HTMLDivElement & { __wasDragged?: () => boolean; __goTo?: (i: number) => void }).__wasDragged = () => dragged;
    (stage as HTMLDivElement & { __wasDragged?: () => boolean; __goTo?: (i: number) => void }).__goTo = animateTo;

    return () => {
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', endDrag);
      stage.removeEventListener('pointercancel', endDrag);
      stage.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', paint);
      clearTimeout(wheelTimer);
    };
  }, [filtered.length, filtered.map(testimonial => testimonial.id).join('|')]);

  const goToCard = (index: number) => {
    const stage = stageRef.current as (HTMLDivElement & { __wasDragged?: () => boolean; __goTo?: (i: number) => void }) | null;
    if (stage?.__wasDragged?.()) return;
    stage?.__goTo?.(index);
  };

  if (filtered.length === 0) return null;
  const activeItem = filtered[Math.min(active, filtered.length - 1)];

  return (
    <section className="py-8 lg:py-10 bg-[#F8FAFC] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="reveal text-center mb-8">
          <span className="line-accent mx-auto" style={{ margin: '0 auto 16px' }} />
          <span className="section-badge mb-4">Client Stories</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F1729] mt-4">
            What our clients{' '}
            <span className="text-[#072069]">say about us</span>
          </h2>
          <p className="text-[#676F7E] mt-4 max-w-lg mx-auto text-sm">
            Trusted by businesses, institutions and individuals across Nepal and beyond.
          </p>
        </div>

        <div className="tf-wrap">
          {filtered.length > 1 && (
            <button type="button" className="tf-arrow prev" aria-label="Previous testimonial" onClick={() => goToCard(active - 1)}>‹</button>
          )}
          <div className="tf-stage" ref={stageRef}>
            <div className="tf-deck">
              {filtered.map((t, i) => (
                <article
                  key={t.id}
                  className="tf-card"
                  ref={el => { cardRefs.current[i] = el; }}
                  onClick={() => goToCard(i)}
                >
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} draggable={false} />
                  ) : (
                    <div className="tf-card-fallback">{initialsOf(t.name)}</div>
                  )}
                  {t.certificateImage && <img src={t.certificateImage} alt="Certificate or delivered system" className="tf-proof-image" draggable={false} />}
                </article>
              ))}
            </div>
          </div>
          {filtered.length > 1 && (
            <button type="button" className="tf-arrow next" aria-label="Next testimonial" onClick={() => goToCard(active + 1)}>›</button>
          )}
          <div className="tf-info">
            <strong>{activeItem.name}</strong>
            <div className="tf-stars">{'★'.repeat(activeItem.rating)}{'☆'.repeat(Math.max(0, 5 - activeItem.rating))}</div>
            <p>“{activeItem.content}”</p>
            {activeItem.overview && <small className="tf-overview">{activeItem.overview}</small>}
            <small>{activeItem.role} · {activeItem.company}</small>
          </div>
        </div>
      </div>
    </section>
  );
}
