-- ============================================================================
-- Leafclutch Technologies — promotions
-- Run after: 18member-private.sql
-- ============================================================================
-- Someone who joins as an intern and later becomes part of the team is one
-- person with one history, not two records. These columns record the move.
--
-- The credential ID deliberately does NOT change on promotion. It is printed
-- on certificates and offer letters and typed into the verification portal, so
-- reissuing it would invalidate every copy already handed out. An intern who
-- becomes an employee keeps LCT-<year>-INT-<n>; the portal shows the current
-- role alongside the history.
--
-- Safe to re-run.
-- ============================================================================

alter table public.members
  add column if not exists promoted_on   date,
  add column if not exists previous_role text,
  add column if not exists previous_type text;

alter table public.members drop constraint if exists members_previous_type_check;
alter table public.members
  add constraint members_previous_type_check
  check (previous_type is null or previous_type in ('founder', 'team', 'intern', 'student'));

comment on column public.members.promoted_on is
  'When this person moved to their current type. Null if they never changed.';


-- ---------------------------------------------------------------------------
-- The portal reports the progression
-- ---------------------------------------------------------------------------

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
  organization  text,
  promoted_on   date,
  previous_role text,
  previous_type text
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
         'Leafclutch Technologies Pvt. Ltd.'::text,
         m.promoted_on,
         m.previous_role,
         m.previous_type
    from public.members m, q
   where length(q.term) >= 3
     and m.credential_id is not null
     and (
       upper(replace(m.credential_id, ' ', '')) = upper(replace(q.term, ' ', ''))
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
-- One-off: Kabita Adhikari
-- ---------------------------------------------------------------------------
-- The historical export held her twice, as an intern from January and as a
-- team member from May, because the promotion was entered as a new record
-- rather than a change to the existing one. They are the same person.
--
-- The intern record is kept: it has her joining date and her contact details,
-- and LCT-2026-INT-0006 is the credential she was actually issued. The later
-- row is removed once its information has been folded in.

update public.members
   set type          = 'team',
       role          = 'Graphic Designer',
       promoted_on   = date '2026-05-01',
       previous_type = 'intern',
       previous_role = 'Graphic Design'
 where id = '06f985a2-1c69-4a0c-af6d-e86f9dd9bcb5'
   and type = 'intern';

delete from public.members
 where id = 'de3fcdd4-8e8c-4c26-87c2-0aa17e33b878';


-- ============================================================================
-- Check it worked. All should say true.
-- ============================================================================
select
  (select count(*) from information_schema.columns
     where table_schema = 'public' and table_name = 'members'
       and column_name in ('promoted_on', 'previous_role', 'previous_type')) = 3
    as columns_added,
  (select count(*) from public.verify_credential(
     (select credential_id from public.members limit 1))) = 1
    as lookup_still_works,
  (select count(*) from public.members where name ilike 'Kabita%') = 1
    as kabita_merged;
