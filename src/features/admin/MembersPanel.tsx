'use client';

import { useState } from 'react';
import { useAdmin, type Member, type MemberType, type NewMember } from '@/app/context/AdminContext';
import { ConfirmDialog, Field, ImageDropzone, Modal } from './shared';

const GROUPS: { type: MemberType; title: string; hint: string }[] = [
  { type: 'founder', title: 'Founders', hint: 'Shown in the Founders section' },
  { type: 'team', title: 'Team Members', hint: 'Shown in the Our Team Members section' },
  { type: 'intern', title: 'Interns', hint: 'Shown in the Our Intern Team section' },
];

function MemberFormModal({ initial, defaultType, onClose, onSave }: { initial?: Member; defaultType: MemberType; onClose: () => void; onSave: (data: NewMember) => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [photo, setPhoto] = useState(initial?.photo ?? '');
  const [linkedin, setLinkedin] = useState(initial?.linkedin ?? '');
  const [type, setType] = useState<MemberType>(initial?.type ?? defaultType);

  return (
    <Modal title={initial ? 'Edit Member' : 'Add Member'} onClose={onClose}>
      <form
        onSubmit={event => {
          event.preventDefault();
          onSave({ name, role, photo, linkedin: linkedin || undefined, type });
        }}
        className="space-y-4"
      >
        <Field label="Photo">
          <ImageDropzone value={photo} onChange={setPhoto} />
        </Field>
        <Field label="Full Name *">
          <input required value={name} onChange={e => setName(e.target.value)} className="admin-input" placeholder="e.g. Er. Siddhartha Pathak" />
        </Field>
        <Field label="Role / Designation *">
          <input required value={role} onChange={e => setRole(e.target.value)} className="admin-input" placeholder="e.g. Founder | Director | CTO" />
        </Field>
        <Field label="LinkedIn URL" hint="Optional — shown as a LinkedIn link on the card">
          <input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="admin-input" placeholder="https://www.linkedin.com/in/…" />
        </Field>
        <Field label="Group">
          <select value={type} onChange={e => setType(e.target.value as MemberType)} className="admin-input">
            <option value="founder">Founder</option>
            <option value="team">Team Member</option>
            <option value="intern">Intern</option>
          </select>
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white py-2.5 rounded-lg text-sm font-semibold">{initial ? 'Save' : 'Add Member'}</button>
        </div>
      </form>
    </Modal>
  );
}

function MemberGroup({ type, title, hint, members, onEdit, onAddNew, onDelete, onReorder }: {
  type: MemberType; title: string; hint: string; members: Member[];
  onEdit: (member: Member) => void; onAddNew: () => void; onDelete: (member: Member) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
}) {
  const sorted = [...members].filter(m => m.type === type).sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-2xl border border-border p-6 mb-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-foreground">{title}</h3>
        <button type="button" onClick={onAddNew} className="text-accent hover:text-[#072069] text-xs font-semibold">+ Add Member</button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{hint}</p>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No members yet.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((member, index) => (
            <div key={member.id} className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-3">
              <span className="w-11 h-11 rounded-full bg-secondary overflow-hidden shrink-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
                {member.photo ? <img src={member.photo} alt="" className="h-full w-full object-cover" /> : member.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" disabled={index === 0} onClick={() => onReorder(member.id, 'up')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▲</button>
                <button type="button" disabled={index === sorted.length - 1} onClick={() => onReorder(member.id, 'down')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▼</button>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => onEdit(member)} className="text-accent hover:text-[#072069] text-xs font-semibold">Edit</button>
                <button type="button" onClick={() => onDelete(member)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MembersPanel() {
  const { members, addMember, updateMember, deleteMember, reorderMember } = useAdmin();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; type: MemberType; member?: Member } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">People</p>
          <h2 className="text-2xl font-bold text-foreground mt-1">Members</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage the founders, team members and interns shown on the About Us page.</p>
        </div>
      </div>

      {GROUPS.map(group => (
        <MemberGroup
          key={group.type}
          type={group.type}
          title={group.title}
          hint={group.hint}
          members={members}
          onAddNew={() => setModal({ mode: 'add', type: group.type })}
          onEdit={member => setModal({ mode: 'edit', type: member.type, member })}
          onDelete={member => setDeleteTarget(member)}
          onReorder={reorderMember}
        />
      ))}

      {modal && (
        <MemberFormModal
          initial={modal.member}
          defaultType={modal.type}
          onClose={() => setModal(null)}
          onSave={data => {
            if (modal.mode === 'edit' && modal.member) updateMember(modal.member.id, data);
            else addMember(data);
            setModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete member?"
          description={`"${deleteTarget.name}" will be removed from the About Us page.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { deleteMember(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
    </div>
  );
}
