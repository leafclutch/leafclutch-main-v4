'use client';

import { DEFAULT_PRICING, type PricingTier } from '@/app/context/AdminContext';
import { FieldGroup } from './shared';

let tierCounter = 0;
const newTierId = () => `tier-${Date.now().toString(36)}-${++tierCounter}`;

/** Textarea line lists keep editing simple — one item per line. */
const toLines = (values: string[]) => values.join('\n');
const fromLines = (text: string) =>
  text.split('\n').map(line => line.trim()).filter(Boolean);

/**
 * Pricing tier editor shared by the product and service editors, so both are
 * managed the same way.
 */
export default function PricingEditor({
  tiers,
  onChange,
}: {
  tiers: PricingTier[];
  onChange: (next: PricingTier[]) => void;
}) {
  const update = (id: string, changes: Partial<PricingTier>) =>
    onChange(tiers.map(t => (t.id === id ? { ...t, ...changes } : t)));

  const remove = (id: string) => onChange(tiers.filter(t => t.id !== id));

  const move = (id: string, direction: -1 | 1) => {
    const index = tiers.findIndex(t => t.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= tiers.length) return;
    const next = [...tiers];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () =>
    onChange([
      ...tiers,
      { id: newTierId(), name: '', price: '', period: 'month', description: '', features: [], notIncluded: [], ctaLabel: 'Get Started' },
    ]);

  // Only one tier should be highlighted at a time.
  const setFeatured = (id: string, on: boolean) =>
    onChange(tiers.map(t => ({ ...t, featured: on ? t.id === id : t.id === id ? false : t.featured })));

  return (
    <FieldGroup
      label="Pricing Plans"
      hint="Shown on the public page. Leave empty to use the standard Starter / Professional / Enterprise plans."
    >
      <div className="space-y-3">
        {tiers.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-5 text-center">
            <p className="text-xs text-muted-foreground">
              No custom pricing — the standard plans are shown.
            </p>
            <button
              type="button"
              onClick={() => onChange(DEFAULT_PRICING.map(t => ({ ...t, id: newTierId() })))}
              className="mt-2 text-xs font-bold text-accent hover:underline"
            >
              Start from the standard plans
            </button>
          </div>
        )}

        {tiers.map((tier, index) => (
          <div key={tier.id} className="rounded-xl border border-border bg-[#F8FAFC] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Plan {index + 1}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" disabled={index === 0} onClick={() => move(tier.id, -1)} className="disabled:opacity-25 hover:text-accent px-1 leading-none">▲</button>
                <button type="button" disabled={index === tiers.length - 1} onClick={() => move(tier.id, 1)} className="disabled:opacity-25 hover:text-accent px-1 leading-none">▼</button>
                <button type="button" onClick={() => remove(tier.id)} className="ml-2 text-red-400 hover:text-red-600 text-xs font-semibold">Remove</button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-foreground">Plan Name</span>
                <input value={tier.name} onChange={e => update(tier.id, { name: e.target.value })} className="admin-input" placeholder="Professional" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-foreground">Price</span>
                <input value={tier.price} onChange={e => update(tier.id, { price: e.target.value })} className="admin-input" placeholder="35,000 or Custom" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-foreground">Per</span>
                <input value={tier.period ?? ''} onChange={e => update(tier.id, { period: e.target.value })} className="admin-input" placeholder="month" />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-foreground">Short Description</span>
              <input value={tier.description} onChange={e => update(tier.id, { description: e.target.value })} className="admin-input" placeholder="For growing organizations" />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-foreground">Included — one per line</span>
                <textarea rows={4} value={toLines(tier.features)} onChange={e => update(tier.id, { features: fromLines(e.target.value) })} className="admin-input resize-none" placeholder={'Core features\nPriority support'} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-foreground">Not included — one per line</span>
                <textarea rows={4} value={toLines(tier.notIncluded ?? [])} onChange={e => update(tier.id, { notIncluded: fromLines(e.target.value) })} className="admin-input resize-none" placeholder={'Custom integrations'} />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-foreground">Button Label</span>
                <input value={tier.ctaLabel ?? ''} onChange={e => update(tier.id, { ctaLabel: e.target.value })} className="admin-input" placeholder="Get Started" />
              </label>
              <label className="flex items-end gap-2 pb-2.5">
                <input
                  type="checkbox"
                  checked={Boolean(tier.featured)}
                  onChange={e => setFeatured(tier.id, e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#0EA5E9] cursor-pointer"
                />
                <span className="text-xs font-medium text-muted-foreground">Highlight as recommended</span>
              </label>
            </div>
          </div>
        ))}

        <button type="button" onClick={add} className="text-accent hover:text-[#072069] text-xs font-semibold">
          + Add Plan
        </button>
      </div>
    </FieldGroup>
  );
}
