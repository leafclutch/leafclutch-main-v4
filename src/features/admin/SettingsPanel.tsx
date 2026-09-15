'use client';

import { useState } from 'react';
import { useAdmin } from '@/app/context/AdminContext';
import { ConfirmDialog, Field } from './shared';

export default function SettingsPanel() {
  const { adminPassword, setAdminPassword, resetContent } = useAdmin();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmNext, setConfirmNext] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    if (current !== adminPassword) { setError('Current password is incorrect.'); return; }
    if (next.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (next !== confirmNext) { setError('New passwords do not match.'); return; }
    setAdminPassword(next);
    setCurrent(''); setNext(''); setConfirmNext(''); setError(''); setSaved(true);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Preferences</p>
        <h2 className="text-2xl font-bold text-foreground mt-1">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage admin access and demo data.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 max-w-lg">
        <h3 className="font-bold text-foreground mb-4">Change admin password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current password"><input type="password" value={current} onChange={e => setCurrent(e.target.value)} className="admin-input" /></Field>
          <Field label="New password"><input type="password" value={next} onChange={e => setNext(e.target.value)} className="admin-input" /></Field>
          <Field label="Confirm new password"><input type="password" value={confirmNext} onChange={e => setConfirmNext(e.target.value)} className="admin-input" /></Field>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {saved && <p className="text-xs text-green-600">Password updated.</p>}
          <button type="submit" className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl">Update Password</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-red-200 p-6 max-w-lg mt-6">
        <h3 className="font-bold text-red-500 mb-1">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Reset all products, testimonials and website images back to the original demo content. This cannot be undone.</p>
        <button type="button" onClick={() => setConfirmReset(true)} className="border border-red-300 text-red-500 hover:bg-red-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">Reset demo content</button>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset demo content?"
          description="This replaces every product, testimonial and website image with the original demo data. Your admin password is not affected."
          confirmLabel="Reset"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => { resetContent(); setConfirmReset(false); }}
        />
      )}
    </div>
  );
}
