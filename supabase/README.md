# Supabase Setup — Leafclutch Technologies

Everything needed to stand up the database on a **brand new Supabase project**.
Run the files in the order below, in the Supabase **SQL Editor**.

| # | File | What it does | Destructive? |
|---|------|--------------|--------------|
| 1 | `1schema.sql` | All tables, indexes, triggers, functions and row-level security | No — safe to re-run |
| 2 | `2storage.sql` | The `media` and `private` storage buckets and their policies | No — safe to re-run |
| 3 | `3seed.sql` | Company details, homepage sections, stats, FAQ/blog categories, SEO defaults | No — never overwrites edits |
| 4 | `4seed-demo-content.sql` | *Optional.* Sample blogs, jobs, FAQs, portfolio, clients, certificate, and the four real SaaS products | No, but read its header first |
| 5 | `5verify.sql` | Read-only checks that everything installed correctly | No |
| — | `reset.sql` | **Drops everything.** Only for starting completely over | ⚠️ **YES** |

> **Don't run the old `supabase-schema.sql` in the repo root.** It only covers 8 of the
> 30 tables and it starts with `drop table ... cascade`, which deletes data. This folder
> replaces it.

---

## Step 1 — Create the project

1. Go to <https://supabase.com/dashboard> and create a new project.
2. Pick a region close to Nepal — **Singapore (ap-southeast-1)** is the best option.
3. Save the database password somewhere safe this time (a password manager).

## Step 2 — Run the SQL

Open **SQL Editor → New query**, paste each file's full contents, and press **Run**.
Do them one at a time, in order: `1schema.sql`, then `2storage.sql`, then `3seed.sql`.

Each one should finish with *Success. No rows returned*.

## Step 3 — Connect the app

In **Project Settings → API**, copy the values into `.env.local` at the repo root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- `NEXT_PUBLIC_*` keys are sent to the browser. That is fine — row-level security is what protects the data.
- `SUPABASE_SERVICE_ROLE_KEY` **bypasses all security**. Server-side only. Never expose it in a `NEXT_PUBLIC_` variable, and never commit `.env.local`.

Restart the dev server after editing `.env.local` — Next.js only reads env files at startup.

## Step 4 — Create your admin account

The admin panel signs in with a real Supabase Auth user.

1. **Authentication → Users → Add user → Create new user**
2. Enter your email and a strong password, and tick **Auto Confirm User**.
3. `1schema.sql` installs a trigger, so a matching row appears in `public.admin_profiles` automatically.

Then lock the door behind you:

- **Authentication → Providers → Email → turn OFF "Enable Sign Ups"**.

Without this, anyone could register an account — and every signed-in user currently has full admin write access.

## Step 5 — Push the existing site content

The app ships with built-in demo content for products, services, testimonials and
team members. It writes that content to the database the first time you save:

1. Visit `/admin` and log in with the account from Step 4.
2. Make any small edit and hit **Save**.
3. Check **Table Editor → services / company_services / members** — rows should now be there.

---

## "Potential issues detected" — what that warning means

The Supabase SQL Editor runs a static linter before executing. On `1schema.sql` it
reports two things. **Both are false alarms. Choose to run the query.**

**1. "This query includes destructive operations."**
It is reacting to `drop trigger if exists`, `drop policy if exists` and `revoke`.
There is no `drop table`, no `delete` and no `truncate` anywhere in `1schema.sql` —
confirm for yourself with:

```bash
grep -nE "^\s*(drop table|delete|truncate)" supabase/1schema.sql   # returns nothing
```

The only things dropped are triggers and policies that the very same script
recreates a few lines later. That is what makes the file safe to re-run.

**2. "This query creates tables without enabling Row Level Security."**
RLS *is* enabled on all 30 tables — but section 15 does it inside `do $$ ... $$`
blocks using `execute format(...)`. That is dynamic SQL generated at runtime, so
the linter cannot see it and assumes the worst.

If the dialog offers to enable RLS for you, accepting is harmless — `alter table
... enable row level security` is idempotent and the script runs it anyway.
Either choice ends with RLS on.

**Verify it yourself afterwards.** Run `5verify.sql`, or just this:

```sql
select tablename from pg_tables where schemaname = 'public' and rowsecurity = false;
```

`No rows returned` means every table is protected.

---

## What's in the schema

| Area | Tables |
|---|---|
| Products (§6, §7) | `services`, `service_images`, `service_features` |
| Services (§5) | `company_services` |
| Blogs (§9) | `blogs`, `blog_categories`, `blog_tags`, `blog_post_tags`, `blog_authors` |
| Careers (§8) | `jobs`, `job_applications` |
| Portfolio (§12) | `portfolio_projects`, `portfolio_images` |
| FAQ (§13) | `faqs`, `faq_categories` |
| Certificates (§11) | `certificates` + `verify_certificate()` |
| Contact (§14) | `contact_enquiries` |
| Testimonials (§15) | `testimonials` |
| Clients (§16) | `clients` |
| Team (§4) | `members` |
| Homepage (§18) | `home_sections`, `stats`, `why_choose_us`, `core_values` |
| Settings (§19) | `site_settings`, `social_links` |
| Media (§20) | `media`, `website_images` |
| SEO (§21) | `seo_settings` |
| Admin (§22) | `admin_profiles` |

### Security model

| Table type | Public (anonymous visitor) | Signed-in admin |
|---|---|---|
| Website content | Read published/active rows only | Full read/write |
| `contact_enquiries`, `job_applications` | **Insert only** — cannot read anything back | Full read/write |
| `certificates` | No direct access at all | Full read/write |
| `admin_profiles` | No access | Read all, edit own row |

Certificate lookups go through a `security definer` function instead of a table read,
so visitors can verify a certificate without the certificate list ever being exposed:

```ts
const { data } = await supabase.rpc('verify_certificate', { p_query: 'John Doe' });
```

It matches on certificate ID or holder name, requires at least 3 characters, returns at
most 10 rows, and never returns holder emails, phone numbers or internal notes.

Dashboard counters come from one call, admins only:

```ts
const { data } = await supabase.rpc('admin_dashboard_counts');
```

### Storage buckets

| Bucket | Public? | Use for |
|---|---|---|
| `media` | Yes | Logos, product screenshots, blog covers, team photos |
| `private` | No | Applicant CVs (`applications/` folder) and certificate PDFs |

Applicants can upload a CV without an account, but only into `private/applications/`,
and nobody anonymous can read anything back out of that bucket.

---

## Things worth knowing

**`1schema.sql` never deletes data.** Every table uses `create table if not exists` and
every policy is dropped and recreated. Re-run it any time you pull schema changes.

**Two ID styles, on purpose.** Admin-managed content uses readable text IDs
(`'pragyaos'`, `'frontend-developer'`) that double as URL slugs and match how the app
already generates IDs. Visitor submissions (`job_applications`, `contact_enquiries`,
`certificates`) use database-generated UUIDs, so nothing is guessable from outside.

**Roles are stored but not yet enforced.** `admin_profiles.role` accepts
`super_admin`, `content_manager`, `hr_manager` and `marketing_manager`, and there is an
`is_admin()` helper ready to use. Today every signed-in user has full access. To tighten
it later, change policies from `to authenticated using (true)` to `using (public.is_admin())`
— no table changes needed.

**The admin panel has a local password fallback.** If Supabase sign-in fails,
`AdminPanel.tsx` still unlocks the UI when the typed password matches the local one.
That person cannot actually write to the database (there is no session, so row-level
security rejects every write), but they can see the panel. Worth removing before launch.

**Business hours in `3seed.sql` are a placeholder** — Sunday–Friday, 9:00 AM – 6:00 PM.
Confirm the real hours and address, then edit them in `site_settings`.

**Delete the sample certificate before launch** if you ran `4seed-demo-content.sql`:

```sql
delete from public.certificates where certificate_id = 'LCT-2026-SAMPLE';
```

## Backups

Free-tier Supabase keeps only daily backups for 7 days. Before any risky change:

**Database → Backups → Download**, or from the CLI:

```bash
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" -f backup.sql
```

Keep the project reference and database password in a password manager so this
account is recoverable.
