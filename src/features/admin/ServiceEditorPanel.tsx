'use client';

import { useEffect, useState } from 'react';
import { useAdmin, type AdminService, type ServiceFeature, type ServiceImage } from '@/app/context/AdminContext';
import { ConfirmDialog, Field, ImageDropzone, Modal, StatusPill } from './shared';
import { TestimonialsBoard } from './TestimonialsPanel';

type SubTab = 'basic' | 'images' | 'features' | 'testimonials' | 'settings';

const TABS: { id: SubTab; label: string; icon: string }[] = [
  { id: 'basic', label: 'Basic Info', icon: '📄' },
  { id: 'images', label: 'Product Images', icon: '🖼️' },
  { id: 'features', label: 'Features', icon: '⚙️' },
  { id: 'testimonials', label: 'Testimonials', icon: '💬' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function ServiceEditorPanel({ serviceId, onBack }: { serviceId: string; onBack: () => void }) {
  const { services, testimonials, updateService, deleteService } = useAdmin();
  const service = services.find(s => s.id === serviceId);
  const [subTab, setSubTab] = useState<SubTab>('basic');
  const [draft, setDraft] = useState<AdminService | null>(service ?? null);
  const [saved, setSaved] = useState(false);
  const [iconEditorOpen, setIconEditorOpen] = useState(false);

  useEffect(() => {
    setDraft(service ?? null);
    setSaved(false);
  }, [service]);

  if (!service || !draft) {
    return (
      <div className="bg-white rounded-2xl border border-border p-10 text-center">
        <p className="text-sm text-muted-foreground mb-4">This product no longer exists.</p>
        <button type="button" onClick={onBack} className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl">Back to Products</button>
      </div>
    );
  }

  const setField = <K extends keyof AdminService>(key: K, value: AdminService[K]) => {
    setDraft(current => current && { ...current, [key]: value });
    setSaved(false);
  };

  const save = () => {
    if (!draft) return;
    updateService(service.id, {
      title: draft.title, label: draft.label, heading: draft.heading,
      description: draft.description, status: draft.status, iconImage: draft.iconImage,
    });
    setSaved(true);
  };

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-3">
        <button type="button" onClick={onBack} className="hover:text-accent">Products</button> <span className="mx-1">›</span> Edit Product
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <span className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl overflow-hidden">
              {draft.iconImage ? <img src={draft.iconImage} alt="" className="h-full w-full object-cover" /> : draft.icon}
            </span>
            <button
              type="button"
              onClick={() => setIconEditorOpen(open => !open)}
              aria-label="Change product icon"
              className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-md hover:opacity-90 transition-opacity"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
            {iconEditorOpen && (
              <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-border bg-white p-3 shadow-xl">
                <p className="text-xs font-semibold text-foreground mb-2">Product icon</p>
                <ImageDropzone compact value={draft.iconImage ?? ''} onChange={url => setField('iconImage', url)} />
                {draft.iconImage && (
                  <button type="button" onClick={() => setField('iconImage', '')} className="mt-2 w-full text-xs font-semibold text-red-500 hover:text-red-600 transition-colors">
                    Remove uploaded icon
                  </button>
                )}
                <button type="button" onClick={() => setIconEditorOpen(false)} className="mt-2 w-full py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground truncate">{draft.title}</h2>
              <StatusPill active={draft.status === 'active'} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Update the content, images and details for this product page.</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <a href={`/services/${service.id}`} target="_blank" rel="noreferrer" className="border border-border text-foreground text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-secondary transition-colors">Preview Page</a>
          <button type="button" onClick={save} className="btn-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl">Save Changes</button>
        </div>
      </div>

      {saved && <p className="text-xs text-green-600 mb-3">Changes saved.</p>}

      <div className="flex items-center gap-1 border-b border-border mb-5 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${subTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'basic' && <BasicInfoTab draft={draft} setField={setField} />}
      {subTab === 'images' && <ServiceImagesTab service={service} />}
      {subTab === 'features' && <FeaturesTab service={service} />}
      {subTab === 'testimonials' && <TestimonialsBoard testimonials={testimonials.filter(t => t.service === service.title)} services={services} scopeService={service.title} />}
      {subTab === 'settings' && <ServiceSettingsTab service={service} onDeleted={onBack} />}
    </div>
  );
}

function BasicInfoTab({ draft, setField }: { draft: AdminService; setField: <K extends keyof AdminService>(key: K, value: AdminService[K]) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-bold text-foreground">Basic Information</h3>
        <Field label="Product Name *"><input required value={draft.title} onChange={e => setField('title', e.target.value)} className="admin-input" /></Field>
        <Field label="Small Label (Top Text)" hint="Shown above the main heading, e.g. RESTAURANT MANAGEMENT SYSTEM"><input value={draft.label} onChange={e => setField('label', e.target.value)} className="admin-input" /></Field>
        <Field label="Main Heading" hint="The big headline at the top of the page"><input value={draft.heading} onChange={e => setField('heading', e.target.value)} className="admin-input" /></Field>
        <Field label="Description"><textarea value={draft.description} onChange={e => setField('description', e.target.value)} rows={3} className="admin-input resize-none" /></Field>
        <Field label="Status">
          <select value={draft.status} onChange={e => setField('status', e.target.value as AdminService['status'])} className="admin-input">
            <option value="active">Published</option>
            <option value="coming_soon">Coming soon</option>
          </select>
        </Field>
      </div>
      <div className="bg-white rounded-2xl border border-border p-4 h-fit">
        <p className="text-xs font-semibold text-foreground mb-2">Live preview</p>
        <div className="rounded-xl overflow-hidden bg-secondary aspect-video flex items-center justify-center">
          {draft.heroImage ? <img src={draft.heroImage} alt="" className="h-full w-full object-cover" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} /> : <span className="text-3xl">{draft.icon}</span>}
        </div>
        <p className="text-[11px] text-accent font-bold uppercase tracking-wide mt-3">{draft.label || 'Small label'}</p>
        <p className="text-sm font-bold text-foreground mt-1 leading-snug">{draft.heading || 'Main heading'}</p>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">{draft.description || 'Description'}</p>
      </div>
    </div>
  );
}

function ServiceImageFormModal({ initial, title, onClose, onSave }: { initial?: { label: string; url: string }; title: string; onClose: () => void; onSave: (data: { label: string; url: string }) => void }) {
  const [form, setForm] = useState({ label: initial?.label ?? '', url: initial?.url ?? '' });
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <Field label="Label *"><input required value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} className="admin-input" placeholder="e.g. Product Screenshot" /></Field>
        <Field label="Image">
          <ImageDropzone value={form.url} onChange={url => setForm(p => ({ ...p, url }))} />
          <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} className="admin-input mt-2" placeholder="Or paste an image URL" />
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white py-2.5 rounded-lg text-sm font-semibold">Save</button>
        </div>
      </form>
    </Modal>
  );
}

function ServiceImagesTab({ service }: { service: AdminService }) {
  const { updateService, addServiceImage, updateServiceImage, deleteServiceImage } = useAdmin();
  const [heroModal, setHeroModal] = useState(false);
  const [imageModal, setImageModal] = useState<{ mode: 'add' | 'replace'; image?: ServiceImage } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceImage | null>(null);
  const heroSlides = service.images.filter(image => /^Hero Image [2-4]$/i.test(image.label));
  const otherImages = service.images.filter(image => !/^Hero Image [2-4]$/i.test(image.label));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-bold text-foreground mb-1">Hero / Profile Image</h3>
        <p className="text-xs text-muted-foreground mb-4">Add up to four images. They will auto-scroll across the product hero.</p>
        <div className="rounded-xl overflow-hidden bg-secondary aspect-video mb-4 flex items-center justify-center">
          {service.heroImage ? <img src={service.heroImage} alt="" className="h-full w-full object-cover" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} /> : <span className="text-3xl">{service.icon}</span>}
        </div>
        <div className="flex gap-3 mb-4">
          <button type="button" onClick={() => setHeroModal(true)} className="flex-1 btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl">↑ Replace Image</button>
          <button type="button" onClick={() => updateService(service.id, { heroImage: '' })} className="border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">Remove</button>
        </div>
        <div className="space-y-2">
          {heroSlides.map(image => (
            <div key={image.id} className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-2.5">
              <img src={image.url} alt="" className="h-12 w-16 rounded-lg object-cover" />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold">{image.label}</span>
              <button type="button" onClick={() => setImageModal({ mode: 'replace', image })} className="text-xs font-semibold text-accent">Replace</button>
              <button type="button" onClick={() => setDeleteTarget(image)} className="text-xs font-semibold text-red-400">Delete</button>
            </div>
          ))}
          {heroSlides.length < 3 && <button type="button" onClick={() => setImageModal({ mode: 'add', image: { id: '', label: `Hero Image ${heroSlides.length + 2}`, url: '' } })} className="text-xs font-semibold text-accent hover:text-[#072069]">+ Add Hero Slide ({heroSlides.length + 1}/4)</button>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-foreground">Other Images</h3>
          <button type="button" onClick={() => setImageModal({ mode: 'add' })} className="text-accent hover:text-[#072069] text-xs font-semibold">+ Add New Image</button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Platform photo, product screenshots and other section images.</p>
        <div className="space-y-3">
          {otherImages.map(image => (
            <div key={image.id} className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-3">
              <img src={image.url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0 bg-secondary" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{image.label}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => setImageModal({ mode: 'replace', image })} className="text-accent hover:text-[#072069] text-xs font-semibold">Replace</button>
                <button type="button" onClick={() => setDeleteTarget(image)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
              </div>
            </div>
          ))}
          {otherImages.length === 0 && <p className="text-sm text-muted-foreground">No extra images yet.</p>}
        </div>
      </div>

      {heroModal && (
        <ServiceImageFormModal
          title="Replace Hero Image"
          initial={{ label: 'Hero image', url: service.heroImage }}
          onClose={() => setHeroModal(false)}
          onSave={data => { updateService(service.id, { heroImage: data.url }); setHeroModal(false); }}
        />
      )}

      {imageModal && (
        <ServiceImageFormModal
          title={imageModal.mode === 'add' ? 'Add New Image' : 'Replace Image'}
          initial={imageModal.image}
          onClose={() => setImageModal(null)}
          onSave={data => {
            if (imageModal.mode === 'replace' && imageModal.image) updateServiceImage(service.id, imageModal.image.id, data);
            else addServiceImage(service.id, data);
            setImageModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete image?"
          description={`"${deleteTarget.label}" will be removed from this product.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteServiceImage(service.id, deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}

function FeatureFormModal({ initial, onClose, onSave }: { initial?: ServiceFeature; onClose: () => void; onSave: (data: { icon: string; image: string; title: string; description: string }) => void }) {
  const [form, setForm] = useState({ icon: initial?.icon ?? '✨', image: initial?.image ?? '', title: initial?.title ?? '', description: initial?.description ?? '' });
  return (
    <Modal title={initial ? 'Edit Feature' : 'Add Feature'} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <Field label="Feature image">
          <ImageDropzone value={form.image} onChange={image => setForm(p => ({ ...p, image }))} compact />
          <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="admin-input mt-2" placeholder="Paste an image URL or upload an image" />
        </Field>
        <Field label="Feature title *"><input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="admin-input" placeholder="e.g. POS & Billing" /></Field>
        <Field label="Short description *"><textarea required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="admin-input resize-none" /></Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white py-2.5 rounded-lg text-sm font-semibold">{initial ? 'Save Changes' : 'Add Feature'}</button>
        </div>
      </form>
    </Modal>
  );
}

function FeaturesTab({ service }: { service: AdminService }) {
  const { addFeature, updateFeature, deleteFeature, reorderFeature } = useAdmin();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; feature?: ServiceFeature } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceFeature | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-foreground">Product Features</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Shown as tabs on the product page, in this order.</p>
        </div>
        <button type="button" onClick={() => setModal({ mode: 'add' })} className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl">+ Add Feature</button>
      </div>

      {service.features.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No features yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2.5 pr-3 font-semibold w-10">#</th>
                <th className="py-2.5 pr-3 font-semibold w-12">Icon</th>
                <th className="py-2.5 pr-3 font-semibold">Feature Title</th>
                <th className="py-2.5 pr-3 font-semibold">Short Description</th>
                <th className="py-2.5 pr-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {service.features.map((feature, index) => (
                <tr key={feature.id} className="border-b border-[#F3F4F7] last:border-0">
                  <td className="py-3 pr-3 text-muted-foreground">
                    <div className="flex flex-col items-center gap-0.5">
                      <button type="button" disabled={index === 0} onClick={() => reorderFeature(service.id, feature.id, 'up')} className="disabled:opacity-25 hover:text-accent leading-none">▲</button>
                      <button type="button" disabled={index === service.features.length - 1} onClick={() => reorderFeature(service.id, feature.id, 'down')} className="disabled:opacity-25 hover:text-accent leading-none">▼</button>
                    </div>
                  </td>
                  <td className="py-3 pr-3">{feature.image ? <img src={feature.image} alt="" className="h-10 w-14 rounded-lg object-cover" /> : <span className="text-xl">{feature.icon}</span>}</td>
                  <td className="py-3 pr-3 font-semibold text-foreground whitespace-nowrap">{feature.title}</td>
                  <td className="py-3 pr-3 text-muted-foreground max-w-md">{feature.description}</td>
                  <td className="py-3 pr-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => setModal({ mode: 'edit', feature })} className="text-accent hover:text-[#072069] text-xs font-semibold mr-3">Edit</button>
                    <button type="button" onClick={() => setDeleteTarget(feature)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <FeatureFormModal
          initial={modal.feature}
          onClose={() => setModal(null)}
          onSave={data => {
            if (modal.mode === 'edit' && modal.feature) updateFeature(service.id, modal.feature.id, data);
            else addFeature(service.id, data);
            setModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete feature?"
          description={`"${deleteTarget.title}" will be removed from this product page.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteFeature(service.id, deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}

function ServiceSettingsTab({ service, onDeleted }: { service: AdminService; onDeleted: () => void }) {
  const { deleteService } = useAdmin();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-red-200 p-6 max-w-lg">
      <h3 className="font-bold text-red-500 mb-1">Danger Zone</h3>
      <p className="text-sm text-muted-foreground mb-4">Deleting this product removes it, its images, and its features from the admin panel. It will no longer appear in the Products list. The live page component stays on the site until you remove it from the codebase.</p>
      <button type="button" onClick={() => setConfirmDelete(true)} className="border border-red-300 text-red-500 hover:bg-red-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">Delete Product</button>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this product?"
          description={`"${service.title}" and all of its admin-managed content will be permanently removed.`}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { deleteService(service.id); setConfirmDelete(false); onDeleted(); }}
        />
      )}
    </div>
  );
}
