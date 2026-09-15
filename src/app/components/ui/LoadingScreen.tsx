import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const BRAND_TEXT = 'LEAFCLUTCH TECHNOLOGY';
const LETTER_DELAY = 0.02;
const HOLD_MS = 60;

export default function LoadingScreen({ onComplete }: Props) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const revealMs = (BRAND_TEXT.length * LETTER_DELAY) * 1000 + 320;
    const hideTimer = setTimeout(() => setHidden(true), revealMs + HOLD_MS);
    const completeTimer = setTimeout(onComplete, revealMs + HOLD_MS + 180);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`loading-screen${hidden ? ' hidden' : ''}`}>
      <h1 className="loading-screen-mark" aria-label={BRAND_TEXT}>
        {BRAND_TEXT.split('').map((char, i) => (
          <span key={i} className="letter" style={{ animationDelay: `${i * LETTER_DELAY}s` }}>
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </h1>
    </div>
  );
}
