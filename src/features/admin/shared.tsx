'use client';

import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/storage';

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground mt-1">{hint}</span>}
    </label>
  );
}

/**
 * Like Field, but renders a <div> instead of a <label>.
 *
 * Use this whenever the group holds more than one control. A <label> may only
 * wrap a single labelable element — nest several and the browser routes every
 * click inside it to the first one, so buttons and checkboxes stop responding.
 */
export function FieldGroup({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="block">
      <span className="block text-xs font-semibold text-foreground mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground mt-1">{hint}</span>}
    </div>
  );
}

export function StatusPill({ active, activeLabel = 'Published', inactiveLabel = 'Coming soon' }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${active ? 'bg-[#3BE3A0]/15 text-[#0aab77]' : 'bg-[#F3F4F7] text-[#676F7E]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#0aab77]' : 'bg-[#676F7E]'}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function StarRatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl leading-none transition-colors ${star <= value ? 'text-[#F59E0B]' : 'text-[#DADEE7] hover:text-[#F59E0B]/60'}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      <span className="text-xs text-muted-foreground ml-1">{value}/5</span>
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return <span className="text-[#F59E0B] text-sm tracking-tight">{'★'.repeat(rating)}{'☆'.repeat(Math.max(0, 5 - rating))}</span>;
}

export function ImageDropzone({ value, onChange, compact = false, folder = 'general' }: { value: string; onChange: (value: string) => void; compact?: boolean; folder?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // The file goes to the Supabase media bucket and only its URL is stored, so
  // the row stays small however large the picture is.
  const readFile = async (file?: File) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      onChange(await uploadImage(file, folder));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={event => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={event => { event.preventDefault(); setDragging(false); void readFile(event.dataTransfer.files[0]); }}
        className={`w-full ${compact ? 'min-h-16' : 'min-h-24'} rounded-xl border-2 border-dashed flex items-center justify-center gap-3 p-3 text-left transition-colors ${dragging ? 'border-accent bg-secondary' : 'border-[#cbd8e8] bg-[#f8fbff] hover:border-accent'}`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6f6ff] text-accent text-lg">{busy ? '…' : '↑'}</span>
        <span>
          <strong className="block text-xs text-foreground">{busy ? 'Uploading…' : 'Drop image here or browse'}</strong>
          <small className="block text-[11px] text-muted-foreground mt-1">JPG, PNG or WebP. Resized and stored in your media bucket.</small>
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={event => void readFile(event.target.files?.[0])} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {value && <img src={value} alt="Selected upload preview" className="mt-2 h-20 w-full rounded-lg object-cover" />}
    </div>
  );
}

export function ConfirmDialog({ title, description, confirmLabel = 'Delete', onCancel, onConfirm }: { title: string; description: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl my-8 shrink-0">
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="button" onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl p-4 sm:p-6 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} shadow-2xl my-4 sm:my-8 shrink-0`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-foreground text-lg">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const ICON_CHOICES = ['🧾', '🪑', '🛒', '📦', '📋', '🍳', '👥', '📊', '💊', '📅', '🚚', '⚠️', '📝', '📈', '🎓', '👩‍🏫', '🗓️', '🏫', '💳', '👨‍👩‍👧', '📢', '⬆️', '🌐', '📱', '☁️', '🛡️', '📣', '🤖', '🔌', '🧩', '📚', '🎥', '🏆', '💬', '✨', '⭐', '🚀', '🔧'];

export function relativeTime(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
