'use client';

export type ProcessStep = {
  step: number;
  title: string;
  description: string;
};

/** Default company process, used where a page has no workflow of its own. */
export const DEFAULT_PROCESS: ProcessStep[] = [
  { step: 1, title: 'Discovery Phase', description: 'understanding your needs and goals' },
  { step: 2, title: 'Project Planning', description: 'creating a detailed roadmap and timeline' },
  { step: 3, title: 'Development', description: 'building with agile methodology' },
  { step: 4, title: 'Final Delivery', description: 'testing, deployment, and ongoing support' },
];

/** Icons cycle so any number of steps gets a sensible glyph. */
const ICONS = [
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4.3-4.3" />
  </>,
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </>,
  <>
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4" />
    <path d="m13 6-2 12" />
  </>,
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </>,
];

function StepIcon({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[index % ICONS.length]}
    </svg>
  );
}

/** Curved connector drawn between two cards; flips on alternate gaps. */
function Connector({ flip }: { flip: boolean }) {
  return (
    <span className={`process-connector${flip ? ' is-flipped' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 90 60" fill="none">
        <path
          d="M4 14c0 26 18 34 40 34s38-10 40-30"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path d="M76 22l8-4 2 9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function ProcessSection({
  steps = DEFAULT_PROCESS,
  badge = 'Our Process',
  title = 'How We Work',
  subtitle = 'A proven methodology that ensures project success.',
  className = '',
}: {
  steps?: ProcessStep[];
  badge?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const ordered = [...steps].sort((a, b) => a.step - b.step);
  if (ordered.length === 0) return null;

  return (
    <section className={`process-section ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto reveal">
          <span className="section-badge">{badge}</span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold text-[#0F1729] text-balance">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-[#676F7E] leading-relaxed text-balance">{subtitle}</p>
          )}
        </div>

        <ol className="process-track reveal">
          {ordered.map((item, index) => (
            <li key={item.step} className="process-item">
              <article className="process-card">
                <span className="process-icon">
                  <StepIcon index={index} />
                </span>
                <p className="process-name">{item.title}</p>
                <strong className="process-num">
                  {String(item.step).padStart(2, '0')}
                </strong>
                <p className="process-quote">&ldquo;{item.description}&rdquo;</p>
                <span className="process-glow" aria-hidden="true" />
              </article>
              {index < ordered.length - 1 && <Connector flip={index % 2 === 1} />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
