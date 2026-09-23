'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CONTACT_EMAIL } from '@/lib/site';

/** One row as the database returns it from verify_credential(). */
type Credential = {
  credential_id: string;
  holder_name: string;
  role: string | null;
  member_type: string;
  photo: string | null;
  joined_on: string | null;
  ended_on: string | null;
  status: string;
  organization: string;
  promoted_on: string | null;
  previous_role: string | null;
  previous_type: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  founder: 'Founder',
  team: 'Team Member',
  intern: 'Intern',
  student: 'Student',
};

const STATUS: Record<string, { label: string; tone: string; note: string }> = {
  active: {
    label: 'Verified',
    tone: 'bg-[#3BE3A0]/15 text-[#0a8f63] ring-[#3BE3A0]/40',
    note: 'Currently with Leafclutch Technologies.',
  },
  completed: {
    label: 'Verified',
    tone: 'bg-[#3BE3A0]/15 text-[#0a8f63] ring-[#3BE3A0]/40',
    note: 'Tenure or programme completed in good standing.',
  },
  revoked: {
    label: 'Revoked',
    tone: 'bg-red-50 text-red-600 ring-red-200',
    note: 'This credential is no longer valid.',
  },
};

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric',
      })
    : null;

function Badge({ status }: { status: string }) {
  const meta = STATUS[status] ?? STATUS.active;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${meta.tone}`}
    >
      {status === 'revoked' ? '✕' : '✓'} {meta.label}
    </span>
  );
}

function ResultCard({ item }: { item: Credential }) {
  const meta = STATUS[item.status] ?? STATUS.active;
  const from = formatDate(item.joined_on);
  const to = formatDate(item.ended_on);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xl font-bold text-muted-foreground">
          {item.photo ? (
            <img src={item.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            item.holder_name.slice(0, 1).toUpperCase()
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-[#0F1729]">{item.holder_name}</h2>
            <Badge status={item.status} />
          </div>
          {item.role && <p className="mt-0.5 text-sm text-[#3F4A5E]">{item.role}</p>}
          {item.promoted_on && item.previous_type && (
            <p className="mt-1 text-xs text-[#0a8f63]">
              {item.previous_role || TYPE_LABEL[item.previous_type] || item.previous_type} →{' '}
              {item.role || TYPE_LABEL[item.member_type]} in {formatDate(item.promoted_on)}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">{meta.note}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
        {[
          ['Credential ID', item.credential_id, true],
          ['Type', TYPE_LABEL[item.member_type] ?? item.member_type, false],
          ['From', from ?? '—', false],
          [to ? 'Until' : 'Status', to ?? (item.status === 'active' ? 'Present' : '—'), false],
        ].map(([label, value, mono]) => (
          <div key={label as string} className="bg-white px-5 py-3">
            <dt className="text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
              {label}
            </dt>
            <dd
              className={`mt-1 text-[#0F1729] ${
                // The ID is the longest value and must not break mid-number,
                // so it gets a smaller face rather than a wrap.
                mono ? 'font-mono text-[13px] whitespace-nowrap' : 'text-sm font-medium'
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="border-t border-border bg-[#F8FAFC] px-5 py-2.5 text-[11px] text-muted-foreground">
        Issued by {item.organization}
      </p>
    </article>
  );
}

export default function VerifyPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Credential[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  const run = useCallback(async (term: string) => {
    const value = term.trim();
    if (value.length < 3) {
      setError('Enter at least three characters — a name or a credential ID.');
      setResults(null);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data, error: rpcError } = await supabase.rpc('verify_credential', {
        p_query: value,
      });
      if (rpcError) throw rpcError;
      setResults((data as Credential[]) ?? []);
      setSearched(value);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      // The function is created by supabase/16verification.sql; say so plainly
      // rather than showing a raw PostgREST error.
      setError(
        /verify_credential|function|schema cache/i.test(message)
          ? 'The verification service is not available yet. Please try again shortly.'
          : 'Something went wrong while checking. Please try again.',
      );
      setResults(null);
    } finally {
      setBusy(false);
    }
  }, []);

  // Support deep links like /verify?q=LCT-2026-INT-0001 so a credential can be
  // linked to directly from a certificate or an email.
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) {
      setQuery(initial);
      void run(initial);
    }
  }, [run]);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-[#0F1729] hero-grid px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#3BE3A0]">
            Credential Verification
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Verify a Leafclutch credential
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#AEC0DE]">
            Check whether someone holds a credential issued by Leafclutch
            Technologies. Search by credential ID or by name.
          </p>

          <form
            onSubmit={event => {
              event.preventDefault();
              void run(query);
            }}
            className="mx-auto mt-7 flex max-w-xl flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="credential-query" className="sr-only">
              Credential ID or name
            </label>
            <input
              id="credential-query"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="LCT-2026-INT-0001  ·  or a name"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-[#7C93BE] outline-none transition-colors focus:border-[#3BE3A0] focus:bg-white/15"
            />
            <button
              type="submit"
              disabled={busy}
              className="btn-primary shrink-0 rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Checking…' : 'Verify'}
            </button>
          </form>

          <p className="mt-3 text-[11px] text-[#7C93BE]">
            IDs look like LCT-2026-EMP-0001 — EMP for employees, INT for interns,
            STD for students.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {!error && results === null && (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <p className="text-sm font-semibold text-[#0F1729]">
              Nothing checked yet
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Enter a credential ID or a name above. Results show the holder,
              their role and whether the credential is still valid.
            </p>
          </div>
        )}

        {!error && results !== null && results.length === 0 && (
          <div className="rounded-2xl border border-border bg-white px-6 py-12 text-center">
            <p className="text-sm font-semibold text-[#0F1729]">
              No credential found for &ldquo;{searched}&rdquo;
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Check the spelling, or try the full credential ID. If you believe
              this is wrong, write to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        )}

        {!error && results !== null && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {results.length === 1
                ? '1 credential found'
                : `${results.length} credentials found`}{' '}
              for &ldquo;{searched}&rdquo;
            </p>
            <div className="space-y-4">
              {results.map(item => (
                <ResultCard key={item.credential_id} item={item} />
              ))}
            </div>
          </>
        )}

        <p className="mt-10 text-center text-xs leading-relaxed text-muted-foreground">
          Results come from Leafclutch&rsquo;s own records and are updated as
          soon as a record changes.{' '}
          <Link href="/contact" className="text-accent hover:underline">
            Contact us
          </Link>{' '}
          if something looks wrong.
        </p>
      </section>
    </main>
  );
}
