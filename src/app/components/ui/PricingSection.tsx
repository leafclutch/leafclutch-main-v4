'use client';

import { useState } from 'react';

interface Plan {
  name: string;
  price: string;
  period?: string;
  desc: string;
  features: string[];
  notIncluded?: string[];
  featured?: boolean;
  cta: string;
}

const tierMeta = [
  {
    label: 'For individuals',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2.5a9.5 9.5 0 000 19z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'For startups',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor" opacity=".55" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity=".55" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity=".3" />
      </svg>
    ),
  },
  {
    label: 'For big companies',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path d="M12 2l9 5v10l-9 5-9-5V7z" fill="currentColor" opacity=".18" />
        <path d="M12 2l9 5-9 5-9-5z" fill="currentColor" />
      </svg>
    ),
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path d="M6 10.2l2.4 2.4L14 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatPrice(plan: Plan, billing: 'monthly' | 'annually') {
  const numeric = Number(plan.price.replace(/[^0-9.]/g, ''));
  const hasPlus = plan.price.includes('+');
  const suffix = plan.period ? `/${plan.period}` : '';

  if (Number.isNaN(numeric) || billing === 'monthly') {
    return { amount: plan.price, suffix, original: null as string | null };
  }

  const discounted = Math.round(numeric * 0.9).toLocaleString() + (hasPlus ? '+' : '');
  return { amount: discounted, suffix, original: plan.price };
}

export default function PricingSection({ plans }: { plans: Plan[] }) {
  const [billing, setBilling] = useState<'monthly' | 'annually'>('monthly');

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 reveal">
          <span className="line-accent mx-auto" style={{ margin: '0 auto 16px' }} />
          <span className="section-badge mb-4">Pricing Plans</span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F1729] mt-4">
            Transparent <span className="gradient-text">pricing</span>
          </h2>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12 reveal">
          <span className={`text-sm font-semibold ${billing === 'monthly' ? 'text-[#0F1729]' : 'text-[#676F7E]'}`}>Monthly</span>
          <button
            type="button"
            role="switch"
            aria-checked={billing === 'annually'}
            onClick={() => setBilling(b => (b === 'monthly' ? 'annually' : 'monthly'))}
            className="relative w-12 h-6.5 rounded-full bg-[#072069] transition-colors shrink-0"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 rounded-full bg-white shadow transition-transform ${billing === 'annually' ? 'translate-x-5.5' : 'translate-x-0'}`}
            />
          </button>
          <span className={`text-sm font-semibold ${billing === 'annually' ? 'text-[#0F1729]' : 'text-[#676F7E]'}`}>Annually</span>
          {billing === 'annually' && (
            <span className="text-xs font-bold bg-[#14C456]/15 text-[#0aab77] px-2.5 py-1 rounded-full">Save 10%</span>
          )}
        </div>

        <div className={`grid gap-6 items-start ${plans.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-3'}`}>
          {plans.map((plan, i) => {
            const meta = tierMeta[i % tierMeta.length];
            const { amount, suffix, original } = formatPrice(plan, billing);
            return (
              <div
                key={plan.name}
                className={`reveal rounded-3xl p-7 flex flex-col relative transition-all ${
                  plan.featured
                    ? 'bg-linear-to-b from-[#0EA5E9] to-[#072069] text-white shadow-2xl md:-translate-y-3'
                    : 'bg-white border border-[#EBF0FA] text-[#0F1729] hover:border-[#0EA5E9]/30 hover:shadow-lg'
                }`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {plan.featured && (
                  <span className="absolute top-6 right-6 text-xs font-bold bg-white/25 text-white px-3 py-1.5 rounded-full">
                    Popular
                  </span>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <span className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${plan.featured ? 'bg-white/15 text-white' : 'bg-[#EAF6FF] text-[#0EA5E9]'}`}>
                    {meta.icon}
                  </span>
                  <div>
                    <p className={`text-xs ${plan.featured ? 'text-white/70' : 'text-[#676F7E]'}`}>{meta.label}</p>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-6 ${plan.featured ? 'text-white/75' : 'text-[#676F7E]'}`}>{plan.desc}</p>

                <div className="mb-6">
                  <div>
                    <span className="text-3xl font-extrabold">NRs. {amount}</span>
                    {suffix && <span className={`text-sm ml-1.5 ${plan.featured ? 'text-white/70' : 'text-[#676F7E]'}`}>{suffix}</span>}
                  </div>
                  {original && (
                    <span className={`text-xs line-through ${plan.featured ? 'text-white/50' : 'text-[#676F7E]/70'}`}>NRs. {original}{suffix}</span>
                  )}
                </div>

                <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${plan.featured ? 'text-white/80' : 'text-[#0F1729]'}`}>What&apos;s included</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5">
                      <span className={`shrink-0 ${plan.featured ? 'text-white' : 'text-[#0EA5E9]'}`}><CheckIcon /></span>
                      <span className={`text-sm ${plan.featured ? 'text-white/90' : 'text-[#0F1729]/80'}`}>{f}</span>
                    </li>
                  ))}
                  {plan.notIncluded?.map(f => (
                    <li key={f} className="flex items-center gap-2.5 opacity-40">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="mailto:info@leafclutchtech.com.np"
                  className={`block text-center py-3.5 rounded-full font-semibold text-sm transition-all ${
                    plan.featured ? 'bg-white text-[#072069] hover:bg-white/90' : 'bg-[#072069] text-white hover:bg-[#0F1729]'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
