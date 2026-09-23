-- ============================================================================
-- Leafclutch Technologies — Credential verification
-- Run after: 15seed-testimonials.sql
-- ============================================================================
-- Turns the Members section into the single record for everyone the company
-- issues a credential to — founders, employees, interns and students — and
-- exposes a public lookup for verify.leafclutch.com.np.
--
-- Two ideas hold it together:
--
--   credential_id    LCT-<year>-<role>-<number>, e.g. LCT-2026-INT-0001.
--                    Assigned automatically, unique, never reused.
--
--   visible_on_site  Whether the person appears on the About page. Someone who
--                    has left, or a student who was never on the team page, can
--                    still be verified without being listed publicly. This is
--                    the eye toggle in the admin panel.
--
-- Safe to re-run.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------

alter table public.members
  add column if not exists credential_id   text,
  add column if not exists visible_on_site boolean not null default true,
  add column if not exists joined_on       date,
  add column if not exists ended_on        date,
  add column if not exists credential_status text not null default 'active';

-- Students receive certificates but are not part of the team listing.
alter table public.members drop constraint if exists members_type_check;
alter table public.members
  add constraint members_type_check
  check (type in ('founder', 'team', 'intern', 'student'));

alter table public.members drop constraint if exists members_credential_status_check;
alter table public.members
  add constraint members_credential_status_check
  check (credential_status in ('active', 'completed', 'revoked'));

create unique index if not exists members_credential_id_key
  on public.members (credential_id)
  where credential_id is not null;


-- ---------------------------------------------------------------------------
-- 2. Credential numbers
-- ---------------------------------------------------------------------------

-- Founders and employees share the EMP series; interns and students have
-- their own.
create or replace function public.credential_role_code(p_type text)
returns text
language sql
immutable
as $$
  select case lower(coalesce(p_type, ''))
           when 'intern'  then 'INT'
           when 'student' then 'STD'
           else 'EMP'
         end;
$$;

-- Numbers run in sequence within a year and role. The advisory lock keeps two
-- concurrent inserts from picking the same number; it is released when the
-- transaction ends.
create or replace function public.next_credential_id(p_type text, p_year int default null)
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_code text := public.credential_role_code(p_type);
  v_year int  := coalesce(p_year, extract(year from current_date)::int);
  v_prefix text;
  v_next int;
begin
  v_prefix := 'LCT-' || v_year::text || '-' || v_code || '-';
  perform pg_advisory_xact_lock(hashtext(v_prefix));

  select coalesce(max(substring(credential_id from '(\d+)$')::int), 0) + 1
    into v_next
    from public.members
   where credential_id like v_prefix || '%';

  return v_prefix || lpad(v_next::text, 4, '0');
end;
$$;

-- Give every member a credential the moment they are created, and keep the
-- role code correct if someone's type changes before one is issued.
create or replace function public.assign_member_credential()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.credential_id is null or btrim(new.credential_id) = '' then
    new.credential_id := public.next_credential_id(new.type);
  end if;
  return new;
end;
$$;

drop trigger if exists members_assign_credential on public.members;
create trigger members_assign_credential
  before insert on public.members
  for each row execute function public.assign_member_credential();


-- ---------------------------------------------------------------------------
-- 3. Backfill
-- ---------------------------------------------------------------------------
-- Existing members get numbers in their current display order, so the sequence
-- reflects the order they were added rather than being arbitrary.

do $$
declare
  rec record;
begin
  for rec in
    select id, type from public.members
     where credential_id is null
     order by type, sort_order, name
  loop
    update public.members
       set credential_id = public.next_credential_id(rec.type)
     where id = rec.id;
  end loop;
end;
$$;


-- ---------------------------------------------------------------------------
-- 4. Public lookup
-- ---------------------------------------------------------------------------
-- Security definer so a hidden member is still verifiable by name or number
-- without being listed by the table's read policy. Only fields that belong on
-- a verification result are returned — no email, no phone, no internal notes.

create or replace function public.verify_credential(p_query text)
returns table (
  credential_id text,
  holder_name   text,
  role          text,
  member_type   text,
  photo         text,
  joined_on     date,
  ended_on      date,
  status        text,
  organization  text
)
language sql
stable
security definer
set search_path = public
as $$
  with q as (select btrim(coalesce(p_query, '')) as term)
  select m.credential_id,
         m.name,
         m.role,
         m.type,
         case when m.visible_on_site then m.photo else null end,
         m.joined_on,
         m.ended_on,
         m.credential_status,
         'Leafclutch Technologies Pvt. Ltd.'::text
    from public.members m, q
   where length(q.term) >= 3
     and m.credential_id is not null
     and (
       -- An exact credential number, however it was typed.
       upper(replace(m.credential_id, ' ', '')) = upper(replace(q.term, ' ', ''))
       -- Or a name: whole, starting with, or containing the term.
       or lower(m.name) = lower(q.term)
       or lower(m.name) like lower(q.term) || '%'
       or lower(m.name) like '%' || lower(q.term) || '%'
     )
   order by
     (upper(replace(m.credential_id, ' ', '')) = upper(replace(q.term, ' ', ''))) desc,
     (lower(m.name) = lower(q.term)) desc,
     m.name
   limit 20;
$$;

revoke all on function public.verify_credential(text) from public;
grant execute on function public.verify_credential(text) to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 5. Hidden members stay off the public API
-- ---------------------------------------------------------------------------
-- Without this, anyone could list every member straight from the REST endpoint
-- and the eye toggle would only be hiding them from the rendered page.

drop policy if exists "public_read_members" on public.members;
create policy "public_read_members" on public.members
  for select
  using (visible_on_site or public.is_admin());


-- ============================================================================
-- Check it worked. Every row should say true.
-- ============================================================================
select
  (select count(*) from public.members where credential_id is null) = 0
    as everyone_has_a_credential,
  (select count(*) = count(distinct credential_id) from public.members)
    as all_credentials_unique,
  (select count(*) from public.verify_credential(
     (select credential_id from public.members limit 1))) = 1
    as lookup_by_number_works;
