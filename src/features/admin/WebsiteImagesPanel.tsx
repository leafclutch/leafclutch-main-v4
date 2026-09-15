'use client';

import { useState } from 'react';
import { useAdmin, type WebsiteImage } from '@/app/context/AdminContext';
import { ConfirmDialog, Field, ImageDropzone, Modal, relativeTime } from './shared';

function WebsiteImageFormModal({ initial, onClose, onSave }: { initial?: WebsiteImage; onClose: () => void; onSave: (data: { name: string; usedIn: string; url: string }) => void }) {
  const [form, setForm] = useState({ name: initial?.name ?? '', usedIn: initial?.usedIn ?? '', url: initial?.url ?? '' });
  return (
    <Modal title={initial ? 'Replace Image' : 'Add Website Image'} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
        <Field label="Image name *">
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="admin-input" placeholder="e.g. Homepage Hero Banner" />
        </Field>
        <Field label="Where it is used *">
          <input required value={form.usedIn} onChange={e => setForm(p => ({ ...p, usedIn: e.target.value }))} className="admin-input" placeholder="e.g. Homepage — products row" />
        </Field>
        <Field label="Image">
          <ImageDropzone value={form.url} onChange={url => setForm(p => ({ ...p, url }))} />
          <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} className="admin-input mt-2" placeholder="Or paste an image URL" />
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white py-2.5 rounded-lg text-sm font-semibold">{initial ? 'Save' : 'Add Image'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function WebsiteImagesPanel() {
  const { websiteImages, addWebsiteImage, updateWebsiteImage, deleteWebsiteImage } = useAdmin();
  const [modal, setModal] = useState<{ mode: 'add' | 'replace'; image?: WebsiteImage } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WebsiteImage | null>(null);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Media</p>
          <h2 className="text-2xl font-bold text-foreground mt-1">Website Images</h2>
          <p className="text-sm text-muted-foreground mt-1">Sitewide images not tied to a specific product page. Per-product photos are managed inside each product's editor.</p>
        </div>
        <button type="button" onClick={() => setModal({ mode: 'add' })} className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl">+ Add Image</button>
      </div>

      {websiteImages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">No sitewide images yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {websiteImages.map(image => (
            <div key={image.id} className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="aspect-video bg-secondary flex items-center justify-center">{image.url ? <img src={image.url} alt={image.name} className="w-full h-full object-cover" /> : <span className="text-3xl">🖼️</span>}</div>
              <div className="p-4">
                <p className="font-semibold text-foreground text-sm truncate">{image.name}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{image.usedIn}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Updated {relativeTime(image.updatedAt)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button type="button" onClick={() => setModal({ mode: 'replace', image })} className="text-accent hover:text-[#072069] text-xs font-semibold">Replace</button>
                  <button type="button" onClick={() => setDeleteTarget(image)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <WebsiteImageFormModal
          initial={modal.image}
          onClose={() => setModal(null)}
          onSave={data => {
            if (modal.mode === 'replace' && modal.image) updateWebsiteImage(modal.image.id, data);
            else addWebsiteImage(data);
            setModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete image?"
          description={`"${deleteTarget.name}" will be removed. The page using it will fall back to its default image.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteWebsiteImage(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
