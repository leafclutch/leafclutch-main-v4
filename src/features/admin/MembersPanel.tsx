'use client';

import { useEffect, useState } from 'react';
import { useAdmin, type CredentialStatus, type Member, type MemberType, type NewMember } from '@/app/context/AdminContext';
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
import { supabase } from '@/lib/supabase';

const GROUPS: { type: MemberType; title: string; hint: string }[] = [
  { type: 'founder', title: 'Founders', hint: 'Shown in the Founders section' },
  { type: 'team', title: 'Team Members', hint: 'Shown in the Our Team Members section' },
  { type: 'intern', title: 'Interns', hint: 'Shown in the Our Intern Team section' },
  {
    type: 'student',
    title: 'Students',
    hint: 'Course and training certificates. Usually hidden from the website, but verifiable.',
  },
];

/**
 * Moves someone to a different group while keeping their history.
 *
 * The credential ID is deliberately left alone: it is printed on certificates
 * and typed into the verification portal, so reissuing it would invalidate
 * every copy already handed out.
 */
function PromoteDialog({ member, onClose, onPromote }: {
  member: Member;
  onClose: () => void;
  onPromote: (changes: Partial<Member>) => void;
}) {
  const [type, setType] = useState<MemberType>(member.type === 'intern' ? 'team' : 'team');
  const [role, setRole] = useState(member.role);
  const [on, setOn] = useState(new Date().toISOString().slice(0, 10));

  return (
    <Modal title={`Promote ${member.name}`} onClose={onClose}>
      <form
        onSubmit={event => {
          event.preventDefault();
          onPromote({
            type,
            role,
            promotedOn: on,
            previousType: member.type,
            previousRole: member.role,
          });
        }}
        className="space-y-4"
      >
        <div className="rounded-xl border border-border bg-[#F8FAFC] p-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">
            {GROUP_LABEL[member.type]} · {member.role}
          </span>
          <span className="mx-2">→</span>
          <span className="font-semibold text-accent">{GROUP_LABEL[type]} · {role || '…'}</span>
          <p className="mt-2">
            Keeps credential{' '}
            <code className="font-mono text-foreground">{member.credentialId}</code>, so
            anything already issued with it still verifies.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Promote to">
            <select value={type} onChange={e => setType(e.target.value as MemberType)} className="admin-input">
              <option value="team">Team Member</option>
              <option value="founder">Founder</option>
              <option value="intern">Intern</option>
            </select>
          </Field>
          <Field label="Effective from">
            <input type="date" value={on} onChange={e => setOn(e.target.value)} className="admin-input" required />
          </Field>
        </div>
        <Field label="New role / designation *">
          <input required value={role} onChange={e => setRole(e.target.value)} className="admin-input" placeholder="e.g. Graphic Designer" />
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">Cancel</button>
          <button type="submit" className="btn-primary flex-1 rounded-lg py-2.5 text-sm font-semibold text-white">Promote</button>
        </div>
      </form>
    </Modal>
  );
}

const GROUP_LABEL: Record<MemberType, string> = {
  founder: 'Founder',
  team: 'Team Member',
  intern: 'Intern',
  student: 'Student',
};

type PrivateDetails = {
  date_of_birth: string;
  phone: string;
  personal_email: string;
  company_email: string;
  notes: string;
};

const EMPTY_PRIVATE: PrivateDetails = {
  date_of_birth: '',
  phone: '',
  personal_email: '',
  company_email: '',
  notes: '',
};

/**
 * Open and closed eye, matching the show-on-website toggle. Drawn inline so the
 * two states share a box and the icon does not shift when it changes.
 */
function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 shrink-0 ${open ? 'text-accent' : 'text-muted-foreground'}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="m4 20 16-16" />}
    </svg>
  );
}

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
  const [visibleOnSite, setVisibleOnSite] = useState(initial?.visibleOnSite !== false);
  const [joinedOn, setJoinedOn] = useState(initial?.joinedOn ?? '');
  const [endedOn, setEndedOn] = useState(initial?.endedOn ?? '');
  const [credentialStatus, setCredentialStatus] =
    useState<CredentialStatus>(initial?.credentialStatus ?? 'active');

  // Personal details live in member_private, which only an admin can read, so
  // they are fetched here rather than travelling with the public member list.
  const [priv, setPriv] = useState<PrivateDetails>(EMPTY_PRIVATE);
  const [privState, setPrivState] = useState<'idle' | 'loading' | 'unavailable'>('idle');

  useEffect(() => {
    if (!initial?.id) return;
    let cancelled = false;
    setPrivState('loading');
    void (async () => {
      const { data, error } = await supabase
        .from('member_private')
        .select('date_of_birth, phone, personal_email, company_email, notes')
        .eq('member_id', initial.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        // Most likely the table has not been created yet.
        setPrivState('unavailable');
        return;
      }
      setPrivState('idle');
      if (data) {
        setPriv({
          date_of_birth: data.date_of_birth ?? '',
          phone: data.phone ?? '',
          personal_email: data.personal_email ?? '',
          company_email: data.company_email ?? '',
          notes: data.notes ?? '',
        });
      }
    })();
    return () => { cancelled = true; };
  }, [initial?.id]);

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
            visibleOnSite,
            joinedOn: joinedOn || undefined,
            endedOn: endedOn || undefined,
            credentialStatus,
          });
          if (initial?.id && privState !== 'unavailable') {
            void supabase.from('member_private').upsert({
              member_id: initial.id,
              date_of_birth: priv.date_of_birth || null,
              phone: priv.phone || null,
              personal_email: priv.personal_email || null,
              company_email: priv.company_email || null,
              notes: priv.notes || null,
            });
          }
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

        {initial?.credentialId && (
          <FieldGroup
            label="Credential ID"
            hint="Issued automatically and never reused. This is what someone types into the verification portal."
          >
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg border border-border bg-[#F8FAFC] px-3 py-2 font-mono text-sm text-foreground">
                {initial.credentialId}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(initial.credentialId!)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-accent"
              >
                Copy
              </button>
            </div>
          </FieldGroup>
        )}

        <FieldGroup
          label="Show on website"
          hint="Turn this off to keep someone verifiable without listing them on the About page — past staff, or students who were never on the team."
        >
          <button
            type="button"
            role="switch"
            aria-checked={visibleOnSite}
            onClick={() => setVisibleOnSite(v => !v)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
              visibleOnSite
                ? 'border-accent/40 bg-accent/5'
                : 'border-border bg-[#F8FAFC]'
            }`}
          >
            <EyeIcon open={visibleOnSite} />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">
                {visibleOnSite ? 'Visible on the website' : 'Hidden from the website'}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {visibleOnSite
                  ? 'Appears on the About page and can be verified.'
                  : 'Not listed anywhere public, but still verifiable by name or credential ID.'}
              </span>
            </span>
            <span
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                visibleOnSite ? 'bg-accent' : 'bg-[#cbd5e1]'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                  visibleOnSite ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </span>
          </button>
        </FieldGroup>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Joined on" hint="Optional">
            <input type="date" value={joinedOn} onChange={e => setJoinedOn(e.target.value)} className="admin-input" />
          </Field>
          <Field label="Ended on" hint="Leave empty if still with us">
            <input type="date" value={endedOn} onChange={e => setEndedOn(e.target.value)} className="admin-input" />
          </Field>
        </div>
        <Field label="Credential status">
          <select
            value={credentialStatus}
            onChange={e => setCredentialStatus(e.target.value as CredentialStatus)}
            className="admin-input"
          >
            <option value="active">Active — currently with Leafclutch</option>
            <option value="completed">Completed — tenure or course finished</option>
            <option value="revoked">Revoked — no longer valid</option>
          </select>
        </Field>

        {initial?.id && (
          <FieldGroup
            label="Private details"
            hint="Kept for your records only. These are stored in a separate admin-only table and are never sent to a visitor — not on the website, not through the verification portal."
          >
            {privState === 'unavailable' ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
                Run supabase/18member-private.sql to store these.
              </p>
            ) : (
              <div className="space-y-3 rounded-xl border border-border bg-[#F8FAFC] p-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date of birth">
                    <input
                      type="date"
                      value={priv.date_of_birth}
                      onChange={e => setPriv(p => ({ ...p, date_of_birth: e.target.value }))}
                      className="admin-input"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      value={priv.phone}
                      onChange={e => setPriv(p => ({ ...p, phone: e.target.value }))}
                      className="admin-input"
                      placeholder="+977…"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Personal email">
                    <input
                      type="email"
                      value={priv.personal_email}
                      onChange={e => setPriv(p => ({ ...p, personal_email: e.target.value }))}
                      className="admin-input"
                    />
                  </Field>
                  <Field label="Company email">
                    <input
                      type="email"
                      value={priv.company_email}
                      onChange={e => setPriv(p => ({ ...p, company_email: e.target.value }))}
                      className="admin-input"
                    />
                  </Field>
                </div>
                <Field label="Internal notes">
                  <textarea
                    value={priv.notes}
                    onChange={e => setPriv(p => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    className="admin-input resize-none"
                    placeholder="Anything you want on file about this person."
                  />
                </Field>
              </div>
            )}
          </FieldGroup>
        )}

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

function MemberGroup({ type, title, hint, members, onEdit, onAddNew, onDelete, onReorder, onToggleVisible, onPromote }: {
  type: MemberType; title: string; hint: string; members: Member[];
  onEdit: (member: Member) => void; onAddNew: () => void; onDelete: (member: Member) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onToggleVisible: (member: Member) => void;
  onPromote: (member: Member) => void;
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
                <p className="text-sm font-semibold text-foreground truncate">
                  {member.name}
                  {member.visibleOnSite === false && (
                    <span className="ml-2 rounded-full bg-[#E9EEF6] px-2 py-0.5 align-middle text-[10px] font-semibold text-muted-foreground">
                      hidden
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                {member.credentialId && (
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground truncate">
                    {member.credentialId}
                  </p>
                )}
                {member.promotedOn && member.previousType && (
                  <p className="mt-0.5 text-[11px] text-[#0a8f63] truncate">
                    ↑ {GROUP_LABEL[member.previousType]} → {GROUP_LABEL[member.type]} ·{' '}
                    {new Date(member.promotedOn).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                )}
                <MemberLinkSummary member={member} />
              </div>
              {/* Show/hide without opening the editor: the most common change. */}
              <button
                type="button"
                onClick={() => onToggleVisible(member)}
                title={member.visibleOnSite === false ? 'Show on website' : 'Hide from website'}
                aria-label={member.visibleOnSite === false ? 'Show on website' : 'Hide from website'}
                aria-pressed={member.visibleOnSite !== false}
                className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white"
              >
                <EyeIcon open={member.visibleOnSite !== false} />
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" disabled={index === 0} onClick={() => onReorder(member.id, 'up')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▲</button>
                <button type="button" disabled={index === sorted.length - 1} onClick={() => onReorder(member.id, 'down')} className="disabled:opacity-25 hover:text-accent leading-none px-1">▼</button>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {member.type !== 'founder' && (
                  <button
                    type="button"
                    onClick={() => onPromote(member)}
                    title={`Move ${member.name} to another group`}
                    className="text-xs font-semibold text-[#0a8f63] hover:text-[#076c4b]"
                  >
                    Promote
                  </button>
                )}
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
  const [promoteTarget, setPromoteTarget] = useState<Member | null>(null);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">People</p>
          <h2 className="text-2xl font-bold text-foreground mt-1">Members</h2>
          <p className="text-sm text-muted-foreground mt-1">Founders, team, interns and students. Everyone here gets a credential ID that can be checked on the verification portal; the eye decides who is listed on the About page.</p>
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
          onToggleVisible={member =>
            updateMember(member.id, { visibleOnSite: member.visibleOnSite === false })
          }
          onPromote={member => setPromoteTarget(member)}
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

      {promoteTarget && (
        <PromoteDialog
          member={promoteTarget}
          onClose={() => setPromoteTarget(null)}
          onPromote={changes => {
            updateMember(promoteTarget.id, changes);
            setPromoteTarget(null);
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
