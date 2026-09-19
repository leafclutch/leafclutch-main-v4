'use client';

import { useState } from 'react';
import { useAdmin, type Member, type MemberType, type NewMember } from '@/app/context/AdminContext';
import SocialIcon from '@/app/components/ui/SocialIcon';
import {
  MEMBER_LINK_PLATFORMS,
  createMemberLink,
  newMemberLinkId,
  platformMeta,
  type MemberLink,
  type MemberLinkPlatform,
} from '@/lib/memberLinks';
import { ConfirmDialog, Field, FieldGroup, ImageDropzone, Modal } from './shared';

const GROUPS: { type: MemberType; title: string; hint: string }[] = [
  { type: 'founder', title: 'Founders', hint: 'Shown in the Founders section' },
  { type: 'team', title: 'Team Members', hint: 'Shown in the Our Team Members section' },
  { type: 'intern', title: 'Interns', hint: 'Shown in the Our Intern Team section' },
];

/** Builds the starting link list, upgrading members saved before this editor existed. */
function initialLinks(member?: Member): MemberLink[] {
  if (member?.links?.length) return member.links.map(link => ({ ...link }));
  if (member?.linkedin) {
    return [{ id: newMemberLinkId(), platform: 'linkedin', url: member.linkedin, visible: true }];
  }
  return [];
}

function LinkRow({ link, onChange, onRemove }: { link: MemberLink; onChange: (next: MemberLink) => void; onRemove: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-[#F8FAFC] p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-border text-primary">
          <SocialIcon platform={link.platform} />
        </span>
        <div className="w-36 shrink-0">
          <select
            value={link.platform}
            onChange={e => onChange({ ...link, platform: e.target.value as MemberLinkPlatform })}
            className="admin-input"
            aria-label="Link type"
          >
            {MEMBER_LINK_PLATFORMS.map(option => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="min-w-0 flex-1 basis-48">
          <input
            value={link.url}
            onChange={e => onChange({ ...link, url: e.target.value })}
            className="admin-input"
            placeholder={platformMeta(link.platform).placeholder}
            aria-label={`${platformMeta(link.platform).label} value`}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 px-2 text-red-400 hover:text-red-600 text-lg leading-none"
          aria-label="Remove link"
          title="Remove link"
        >
          ×
        </button>
      </div>

      {link.platform === 'other' && (
        <input
          value={link.label ?? ''}
          onChange={e => onChange({ ...link, label: e.target.value })}
          className="admin-input"
          placeholder="Button label — e.g. Portfolio, Behance, Dribbble"
          aria-label="Custom link label"
        />
      )}

      <div className="flex items-center gap-2">
        <input
          id={`link-visible-${link.id}`}
          type="checkbox"
          checked={link.visible}
          onChange={e => onChange({ ...link, visible: e.target.checked })}
          className="h-3.5 w-3.5 accent-[#0EA5E9] cursor-pointer"
        />
        <label
          htmlFor={`link-visible-${link.id}`}
          className="text-xs font-medium text-muted-foreground cursor-pointer select-none"
        >
          {link.visible
            ? 'Visible on the website'
            : 'Hidden — saved, but not shown on the website'}
        </label>
      </div>
    </div>
  );
}

function MemberFormModal({ initial, defaultType, onClose, onSave }: { initial?: Member; defaultType: MemberType; onClose: () => void; onSave: (data: NewMember) => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [photo, setPhoto] = useState(initial?.photo ?? '');
  const [links, setLinks] = useState<MemberLink[]>(() => initialLinks(initial));
  const [type, setType] = useState<MemberType>(initial?.type ?? defaultType);

  const updateLink = (id: string, next: MemberLink) =>
    setLinks(current => current.map(link => (link.id === id ? next : link)));
  const removeLink = (id: string) =>
    setLinks(current => current.filter(link => link.id !== id));
  const addLink = () => setLinks(current => [...current, createMemberLink()]);

  return (
    <Modal title={initial ? 'Edit Member' : 'Add Member'} onClose={onClose}>
      <form
        onSubmit={event => {
          event.preventDefault();
          // Drop rows the user left blank so empty buttons never reach the site.
          const cleaned = links
            .filter(link => link.url.trim() !== '')
            .map(link => ({ ...link, url: link.url.trim() }));
          onSave({
            name,
            role,
            photo,
            links: cleaned,
            linkedin: cleaned.find(link => link.platform === 'linkedin')?.url,
            type,
          });
        }}
        className="space-y-4"
      >
        <Field label="Photo">
          <ImageDropzone value={photo} onChange={setPhoto} folder="team" />
        </Field>
        <Field label="Full Name *">
          <input required value={name} onChange={e => setName(e.target.value)} className="admin-input" placeholder="e.g. Er. Siddhartha Pathak" />
        </Field>
        <Field label="Role / Designation *">
          <input required value={role} onChange={e => setRole(e.target.value)} className="admin-input" placeholder="e.g. Founder | Director | CTO" />
        </Field>

        <FieldGroup label="Contact & Social Links" hint="Add as many as you like. Untick a link to keep it on record without showing it on the website.">
          <div className="space-y-2">
            {links.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded-xl">
                No links yet.
              </p>
            ) : (
              links.map(link => (
                <LinkRow
                  key={link.id}
                  link={link}
                  onChange={next => updateLink(link.id, next)}
                  onRemove={() => removeLink(link.id)}
                />
              ))
            )}
            <button type="button" onClick={addLink} className="text-accent hover:text-[#072069] text-xs font-semibold">
              + Add link
            </button>
          </div>
        </FieldGroup>

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

/** Small "2 visible · 1 hidden" line under each name in the list. */
function MemberLinkSummary({ member }: { member: Member }) {
  const links = member.links ?? [];
  if (links.length === 0) return null;
  const visible = links.filter(link => link.visible && link.url.trim() !== '');
  const hidden = links.length - visible.length;

  return (
    <p className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
      {visible.map(link => (
        <span key={link.id} className="text-primary" title={platformMeta(link.platform).label}>
          <SocialIcon platform={link.platform} className="h-4 w-4" />
        </span>
      ))}
      {visible.length === 0 && <span>No visible links</span>}
      {hidden > 0 && <span className="ml-0.5">· {hidden} hidden</span>}
    </p>
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
                <MemberLinkSummary member={member} />
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
