-- ============================================================================
-- Leafclutch Technologies — private personnel details
-- Run after: 17seed-historical-members.sql
-- ============================================================================
-- Every column of `members` is readable by the public for anyone whose
-- visible_on_site is true, so a date of birth or a phone number cannot live
-- there. This table holds those details instead: one row per member, readable
-- and writable only by an active admin.
--
-- What stays public, on the member row and through verify_credential():
--   name, position, start date, end date, and whether the credential is valid.
--
-- What lives here, and is never exposed to a visitor:
--   date of birth, phone number, personal email, company email, internal notes.
--
-- Safe to re-run.
-- ============================================================================

create table if not exists public.member_private (
  member_id      text primary key
                   references public.members(id) on delete cascade,
  date_of_birth  date,
  phone          text,
  personal_email text,
  company_email  text,
  notes          text,
  updated_at     timestamptz not null default now()
);

drop trigger if exists member_private_set_updated_at on public.member_private;
create trigger member_private_set_updated_at
  before update on public.member_private
  for each row execute function public.set_updated_at();

alter table public.member_private enable row level security;

-- Admins only. There is deliberately no public read policy.
drop policy if exists "admin_manage_member_private" on public.member_private;
create policy "admin_manage_member_private" on public.member_private
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Belt and braces: even if a policy were added by mistake later, the anonymous
-- role has no privilege on the table at all.
revoke all on public.member_private from anon;
grant select, insert, update, delete on public.member_private to authenticated;


-- ============================================================================
-- Check it worked. Every row should say true.
-- ============================================================================
select
  (select count(*) from pg_policies
     where schemaname = 'public' and tablename = 'member_private'
       and qual like '%is_admin%') = 1
    as admin_only_policy,
  (select has_table_privilege('anon', 'public.member_private', 'SELECT')) = false
    as anon_cannot_read,
  (select relrowsecurity from pg_class where oid = 'public.member_private'::regclass)
    as rls_enabled;
