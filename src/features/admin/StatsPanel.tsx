'use client';

import { useState } from 'react';
import {
  useAdmin,
  type NewStat,
  type Stat,
  type StatContext,
} from '@/app/context/AdminContext';
import StatIcon, { STAT_ICONS } from '@/app/components/ui/StatIcon';
import { ConfirmDialog, Field, FieldGroup, Modal } from './shared';

const CONTEXTS: { value: StatContext; label: string; hint: string }[] = [
  { value: 'both', label: 'Home + About Us', hint: 'Shown on every page that lists statistics' },
  { value: 'home', label: 'Home page only', hint: 'Hero counters and the Our Journey cards' },
  { value: 'about', label: 'About Us only', hint: 'The statistics row on the About page' },
  { value: 'nepal', label: 'Nepal reach band', hint: 'The blue "Powering Businesses Across Nepal" band on the home page' },
];

function StatFormModal({ initial, onClose, onSave }: {
  initial?: Stat;
  onClose: () => void;
  onSave: (data: NewStat) => void;
}) {
  const [value, setValue] = useState(initial?.value ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [caption, setCaption] = useState(initial?.caption ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'layers');
  const [context, setContext] = useState<StatContext>(initial?.context ?? 'both');
  const [status, setStatus] = useState<'active' | 'draft'>(initial?.status ?? 'active');

  return (
    <Modal title={initial ? 'Edit Statistic' : 'Add Statistic'} onClose={onClose}>
      <form
        onSubmit={e => {
          e.preventDefault();
          onSave({ value, unit, label, caption, icon, context, status });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Number *" hint='e.g. 100+ or 99.9%'>
            <input required value={value} onChange={e => setValue(e.target.value)} className="admin-input" placeholder="100+" />
          </Field>
          <Field label="Unit" hint='Word after the number on the Journey cards'>
            <input value={unit} onChange={e => setUnit(e.target.value)} className="admin-input" placeholder="Clients" />
          </Field>
        </div>

        <Field label="Label *" hint="Short text under the number, e.g. Happy Clients">
          <input required value={label} onChange={e => setLabel(e.target.value)} className="admin-input" placeholder="Happy Clients" />
        </Field>

        <Field label="Caption" hint="Longer line used on the Our Journey cards">
          <input value={caption} onChange={e => setCaption(e.target.value)} className="admin-input" placeholder="Trust Our Solutions" />
        </Field>

        <FieldGroup label="Icon">
          <div className="flex flex-wrap gap-2">
            {STAT_ICONS.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => setIcon(option.key)}
                title={option.label}
                aria-pressed={icon === option.key}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                  icon === option.key
                    ? 'border-accent bg-accent/10 text-primary'
                    : 'border-border bg-white text-muted-foreground hover:border-accent/50'
                }`}
              >
                <StatIcon icon={option.key} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </FieldGroup>

        <Field label="Show on" hint={CONTEXTS.find(c => c.value === context)?.hint}>
          <select value={context} onChange={e => setContext(e.target.value as StatContext)} className="admin-input">
            {CONTEXTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>

        <Field label="Status">
          <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'draft')} className="admin-input">
            <option value="active">Active — visible on the website</option>
            <option value="draft">Draft — hidden</option>
          </select>
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white py-2.5 rounded-lg text-sm font-semibold">{initial ? 'Save' : 'Add Statistic'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function StatsPanel() {
  const { stats, addStat, updateStat, deleteStat, reorderStat } = useAdmin();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; stat?: Stat } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Stat | null>(null);

  const sorted = [...stats].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Content</p>
          <h2 className="text-2xl font-bold text-foreground mt-1">Statistics</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            One source of truth for every counter on the site. These feed the home hero,
            the &ldquo;Our Journey&rdquo; cards and the About Us page — edit once, updates everywhere.
          </p>
        </div>
        <button type="button" onClick={() => setModal({ mode: 'add' })} className="btn-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
          + Add Statistic
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No statistics yet.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((stat, index) => (
              <div key={stat.id} className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white border border-border text-primary">
                  <StatIcon icon={stat.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {stat.value}{stat.unit ? ` ${stat.unit}` : ''}
                    <span className="font-normal text-muted-foreground"> · {stat.label}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {CONTEXTS.find(c => c.value === stat.context)?.label}
                    {stat.status === 'draft' && ' · Hidden'}
                    {stat.caption ? ` · ${stat.caption}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" disabled={index === 0} onClick={() => reorderStat(stat.id, 'up')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▲</button>
                  <button type="button" disabled={index === sorted.length - 1} onClick={() => reorderStat(stat.id, 'down')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▼</button>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button type="button" onClick={() => setModal({ mode: 'edit', stat })} className="text-accent hover:text-[#072069] text-xs font-semibold">Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(stat)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <StatFormModal
          initial={modal.stat}
          onClose={() => setModal(null)}
          onSave={data => {
            if (modal.mode === 'edit' && modal.stat) updateStat(modal.stat.id, data);
            else addStat(data);
            setModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete statistic?"
          description={`"${deleteTarget.label}" will be removed from every page that shows it.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteStat(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
