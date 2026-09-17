'use client';

import { useMemo, useState } from 'react';
import { useAdmin, FAQ_CATEGORIES, type Faq, type NewFaq } from '@/app/context/AdminContext';
import { ConfirmDialog, Field, Modal } from './shared';

function FaqFormModal({ initial, onClose, onSave }: {
  initial?: Faq;
  onClose: () => void;
  onSave: (data: NewFaq) => void;
}) {
  const [question, setQuestion] = useState(initial?.question ?? '');
  const [answer, setAnswer] = useState(initial?.answer ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'General');
  const [status, setStatus] = useState<'active' | 'draft'>(initial?.status ?? 'active');

  return (
    <Modal title={initial ? 'Edit Question' : 'Add Question'} onClose={onClose} wide>
      <form
        onSubmit={e => { e.preventDefault(); onSave({ question, answer, category, status }); }}
        className="space-y-4"
      >
        <Field label="Question *">
          <input required value={question} onChange={e => setQuestion(e.target.value)} className="admin-input" placeholder="e.g. How long does a project take?" />
        </Field>
        <Field label="Answer *" hint="Keep it direct — two or three sentences reads best">
          <textarea required value={answer} onChange={e => setAnswer(e.target.value)} rows={5} className="admin-input resize-none" placeholder="It depends on scope…" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" hint="Becomes a filter chip on the FAQ page">
            <select value={category} onChange={e => setCategory(e.target.value)} className="admin-input">
              {FAQ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'draft')} className="admin-input">
              <option value="active">Active — visible on the website</option>
              <option value="draft">Draft — hidden</option>
            </select>
          </Field>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white py-2.5 rounded-lg text-sm font-semibold">{initial ? 'Save' : 'Add Question'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function FaqsPanel() {
  const { faqs, addFaq, updateFaq, deleteFaq, reorderFaq } = useAdmin();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; faq?: Faq } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const sorted = useMemo(() => [...faqs].sort((a, b) => a.order - b.order), [faqs]);
  const shown = filter === 'All' ? sorted : sorted.filter(f => f.category === filter);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Support</p>
          <h2 className="text-2xl font-bold text-foreground mt-1">FAQ</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Questions shown on the FAQ page. Categories become filter chips, and the order
            below is the order visitors see.
          </p>
        </div>
        <button type="button" onClick={() => setModal({ mode: 'add' })} className="btn-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
          + Add Question
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {['All', ...FAQ_CATEGORIES].map(c => {
          const count = c === 'All' ? sorted.length : sorted.filter(f => f.category === c).length;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                filter === c ? 'bg-primary text-white' : 'bg-[#F1F5F9] text-muted-foreground hover:bg-[#E4ECF7]'
              }`}
            >
              {c} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No questions in this category yet.</p>
        ) : (
          <div className="space-y-2">
            {shown.map((item, index) => (
              <div key={item.id} className="flex items-start gap-3 bg-[#F8FAFC] rounded-xl p-3">
                <span className="mt-0.5 shrink-0 rounded-md bg-white border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {item.category}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{item.question}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {item.status === 'draft' ? 'Hidden · ' : ''}{item.answer}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" disabled={index === 0} onClick={() => reorderFaq(item.id, 'up')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▲</button>
                  <button type="button" disabled={index === shown.length - 1} onClick={() => reorderFaq(item.id, 'down')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▼</button>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button type="button" onClick={() => setModal({ mode: 'edit', faq: item })} className="text-accent hover:text-[#072069] text-xs font-semibold">Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(item)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <FaqFormModal
          initial={modal.faq}
          onClose={() => setModal(null)}
          onSave={data => {
            if (modal.mode === 'edit' && modal.faq) updateFaq(modal.faq.id, data);
            else addFaq(data);
            setModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete question?"
          description={`"${deleteTarget.question}" will be removed from the FAQ page.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteFaq(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
