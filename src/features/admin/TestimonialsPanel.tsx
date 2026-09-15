'use client';

import { useMemo, useState } from 'react';
import { useAdmin, type AdminService, type Testimonial } from '@/app/context/AdminContext';
import { ConfirmDialog, Field, ImageDropzone, Modal, StarRatingInput, Stars } from './shared';

type TestimonialFormValues = Omit<Testimonial, 'id'>;

function emptyForm(defaultService: string): TestimonialFormValues {
  return {
    name: '', role: '', company: '', content: '', rating: 5, service: defaultService,
    photo: '', certificateImage: '', overview: '', publishedAt: new Date().toISOString().slice(0, 10), status: 'published',
  };
}

function TestimonialFormModal({ services, initial, defaultService = 'General', onClose, onSave }: {
  services: AdminService[];
  initial?: Testimonial;
  defaultService?: string;
  onClose: () => void;
  onSave: (data: TestimonialFormValues) => void;
}) {
  const [form, setForm] = useState<TestimonialFormValues>(initial ? { ...initial } : emptyForm(defaultService));

  return (
    <Modal title={initial ? 'Edit Testimonial' : 'Add Testimonial'} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client name *">
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="admin-input" placeholder="e.g. Rohan KC" />
          </Field>
          <Field label="Designation *">
            <input required value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="admin-input" placeholder="Founder, Principal, etc." />
          </Field>
        </div>
        <Field label="Company / organization *">
          <input required value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="admin-input" placeholder="Company name" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Related product">
            <select value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} className="admin-input">
              <option>General</option>
              {services.map(service => <option key={service.id}>{service.title}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Testimonial['status'] }))} className="admin-input">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
        </div>
        <Field label="Star rating *">
          <StarRatingInput value={form.rating} onChange={rating => setForm(p => ({ ...p, rating }))} />
        </Field>
        <Field label="Review / comment *">
          <textarea required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={3} className="admin-input resize-none" placeholder="What did the client say?" />
        </Field>
        <Field label="Client / student overview">
          <textarea value={form.overview} onChange={e => setForm(p => ({ ...p, overview: e.target.value }))} rows={2} className="admin-input resize-none" placeholder="Optional: e.g. Completed Full Stack Development and built a POS project." />
        </Field>
        <Field label="Client / profile image">
          <ImageDropzone value={form.photo ?? ''} onChange={photo => setForm(p => ({ ...p, photo }))} compact />
          <input value={form.photo ?? ''} onChange={e => setForm(p => ({ ...p, photo: e.target.value }))} className="admin-input mt-2" placeholder="Or paste an image URL" />
        </Field>
        <Field label="Certificate / delivered system image">
          <ImageDropzone value={form.certificateImage ?? ''} onChange={certificateImage => setForm(p => ({ ...p, certificateImage }))} compact />
          <input value={form.certificateImage ?? ''} onChange={e => setForm(p => ({ ...p, certificateImage: e.target.value }))} className="admin-input mt-2" placeholder="Optional" />
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white py-2.5 rounded-lg text-sm font-semibold">{initial ? 'Save Changes' : 'Add Testimonial'}</button>
        </div>
      </form>
    </Modal>
  );
}

export function TestimonialsBoard({ testimonials, services, scopeService }: { testimonials: Testimonial[]; services: AdminService[]; scopeService?: string }) {
  const { addTestimonial, updateTestimonial, deleteTestimonial } = useAdmin();
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; testimonial?: Testimonial } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const filtered = useMemo(() => testimonials.filter(t => {
    if (!scopeService && serviceFilter !== 'All' && t.service !== serviceFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [testimonials, serviceFilter, search, scopeService]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        {!scopeService ? (
          <div className="flex items-center gap-2 flex-wrap">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or company…" className="admin-input max-w-56" />
            <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="admin-input max-w-48">
              <option>All</option>
              <option>General</option>
              {services.map(service => <option key={service.id}>{service.title}</option>)}
            </select>
          </div>
        ) : <span className="text-xs text-muted-foreground">{filtered.length} testimonial{filtered.length === 1 ? '' : 's'} for this product</span>}
        <button type="button" onClick={() => setModal({ mode: 'add' })} className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl shrink-0">+ Add Testimonial</button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">No testimonials yet.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border bg-[#F8FAFC]">
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Designation</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  {!scopeService && <th className="px-4 py-3 font-semibold">Product</th>}
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-[#F3F4F7] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {t.photo ? <img src={t.photo} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" /> : <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-400 to-[#072069] flex items-center justify-center text-white font-bold text-[11px] shrink-0">{t.name.split(' ').map(n => n[0]).join('')}</div>}
                        <span className="font-semibold text-foreground whitespace-nowrap">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.role}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.company}</td>
                    {!scopeService && <td className="px-4 py-3"><span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground whitespace-nowrap">{t.service}</span></td>}
                    <td className="px-4 py-3"><Stars rating={t.rating} /></td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => updateTestimonial(t.id, { status: t.status === 'published' ? 'draft' : 'published' })}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${t.status === 'published' ? 'bg-[#3BE3A0]/15 text-[#0aab77]' : 'bg-[#F3F4F7] text-[#676F7E]'}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${t.status === 'published' ? 'bg-[#0aab77]' : 'bg-[#676F7E]'}`} />
                        {t.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                        <button type="button" onClick={() => setModal({ mode: 'edit', testimonial: t })} className="text-accent hover:text-[#072069] text-xs font-semibold">Edit</button>
                        <button type="button" onClick={() => setDeleteTarget(t)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <TestimonialFormModal
          services={services}
          initial={modal.testimonial}
          defaultService={scopeService ?? modal.testimonial?.service}
          onClose={() => setModal(null)}
          onSave={data => {
            if (modal.mode === 'edit' && modal.testimonial) updateTestimonial(modal.testimonial.id, data);
            else addTestimonial(data);
            setModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete testimonial?"
          description={`This will remove ${deleteTarget.name}'s testimonial from the site immediately.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteTestimonial(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}

export default function TestimonialsPanel() {
  const { testimonials, services } = useAdmin();
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Client Stories</p>
        <h2 className="text-2xl font-bold text-foreground mt-1">Testimonials</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage every review shown across your product pages.</p>
      </div>
      <TestimonialsBoard testimonials={testimonials} services={services} />
    </div>
  );
}
