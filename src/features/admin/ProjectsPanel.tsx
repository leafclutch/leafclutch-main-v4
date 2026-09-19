'use client';

import { useState } from 'react';
import { useAdmin, type NewProject, type Project } from '@/app/context/AdminContext';
import { ConfirmDialog, Field, ImageDropzone, Modal } from './shared';

function ProjectFormModal({ initial, onClose, onSave }: {
  initial?: Project;
  onClose: () => void;
  onSave: (data: NewProject) => void;
}) {
  const [company, setCompany] = useState(initial?.company ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [testimonial, setTestimonial] = useState(initial?.testimonial ?? '');
  const [testimonialAuthor, setTestimonialAuthor] = useState(initial?.testimonialAuthor ?? '');
  const [status, setStatus] = useState<'active' | 'draft'>(initial?.status ?? 'active');

  return (
    <Modal title={initial ? 'Edit Project' : 'Add Project'} onClose={onClose} wide>
      <form
        onSubmit={e => {
          e.preventDefault();
          onSave({
            company, url,
            // A pasted URL wins only when nothing was uploaded.
            image: image || imageUrl.trim(),
            category, description, testimonial, testimonialAuthor, status,
          });
        }}
        className="space-y-4"
      >
        <Field label="Project Image" hint="Upload a screenshot, or paste an image URL below">
          <ImageDropzone value={image} onChange={setImage} folder="portfolio" />
        </Field>
        {!image && (
          <Field label="…or Image URL">
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="admin-input" placeholder="https://…/screenshot.png" />
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company Name *">
            <input required value={company} onChange={e => setCompany(e.target.value)} className="admin-input" placeholder="e.g. HRestroSewa" />
          </Field>
          <Field label="Category" hint="e.g. Web App, SaaS Product, Branding">
            <input value={category} onChange={e => setCategory(e.target.value)} className="admin-input" placeholder="Web App" />
          </Field>
        </div>

        <Field label="Website URL" hint="Where the Visit Site button goes">
          <input value={url} onChange={e => setUrl(e.target.value)} className="admin-input" placeholder="https://example.com" />
        </Field>

        <Field label="Short Description">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="admin-input resize-none" placeholder="What you built for them." />
        </Field>

        <Field label="Testimonial" hint="What the client said about the work">
          <textarea value={testimonial} onChange={e => setTestimonial(e.target.value)} rows={3} className="admin-input resize-none" placeholder="“They delivered exactly what we needed…”" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Testimonial Author" hint="Name and role, or company">
            <input value={testimonialAuthor} onChange={e => setTestimonialAuthor(e.target.value)} className="admin-input" placeholder="Restaurant Owner, Butwal" />
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
          <button type="submit" className="flex-1 btn-primary text-white py-2.5 rounded-lg text-sm font-semibold">{initial ? 'Save' : 'Add Project'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ProjectsPanel() {
  const { projects, addProject, updateProject, deleteProject, reorderProject } = useAdmin();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; project?: Project } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const sorted = [...projects].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Portfolio</p>
          <h2 className="text-2xl font-bold text-foreground mt-1">Our Work</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Projects shown on the Our Work page. Each card carries the company name, image,
            testimonial and a Visit Site button.
          </p>
        </div>
        <button type="button" onClick={() => setModal({ mode: 'add' })} className="btn-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold">
          + Add Project
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No projects yet.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((project, index) => (
              <div key={project.id} className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-3">
                <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white text-sm font-bold text-muted-foreground">
                  {project.image
                    ? <img src={project.image} alt="" className="h-full w-full object-cover" />
                    : project.company.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{project.company}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {project.status === 'draft' ? 'Hidden' : 'Visible'}
                    {project.category ? ` · ${project.category}` : ''}
                    {project.testimonial ? ' · has testimonial' : ''}
                    {project.url ? ` · ${project.url}` : ' · no link'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" disabled={index === 0} onClick={() => reorderProject(project.id, 'up')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▲</button>
                  <button type="button" disabled={index === sorted.length - 1} onClick={() => reorderProject(project.id, 'down')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▼</button>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button type="button" onClick={() => setModal({ mode: 'edit', project })} className="text-accent hover:text-[#072069] text-xs font-semibold">Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(project)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ProjectFormModal
          initial={modal.project}
          onClose={() => setModal(null)}
          onSave={data => {
            if (modal.mode === 'edit' && modal.project) updateProject(modal.project.id, data);
            else addProject(data);
            setModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete project?"
          description={`"${deleteTarget.company}" will be removed from the Our Work page.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteProject(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
