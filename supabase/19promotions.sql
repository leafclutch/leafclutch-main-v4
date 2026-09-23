-- ============================================================================
-- Leafclutch Technologies — promotions
-- Run after: 18member-private.sql
-- ============================================================================
-- A promotion creates a second record rather than editing the first.
--
-- Someone who interns and is then taken on has completed two distinct
-- engagements, and each has its own credential: the internship closes as
-- `completed` with an end date, and a new row opens with a fresh EMP number.
-- Both stay verifiable for ever, so an internship certificate issued in
-- January still checks out after the person joins the team in May.
--
-- `promoted_from` links the new record back to the one it grew out of, and
-- previous_role / previous_type / promoted_on are copied onto it so the portal
-- can show the progression without a join.
--
-- Safe to re-run.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------

alter table public.members
  add column if not exists promoted_on   date,
  add column if not exists previous_role text,
  add column if not exists previous_type text,
  add column if not exists promoted_from text;

alter table public.members drop constraint if exists members_previous_type_check;
alter table public.members
  add constraint members_previous_type_check
  check (previous_type is null or previous_type in ('founder', 'team', 'intern', 'student'));

-- Deliberately not a foreign key: deleting an old record should not cascade
-- into the newer one, which stands on its own.
comment on column public.members.promoted_from is
  'The member record this one was promoted from. The earlier record keeps its own credential.';
comment on column public.members.promoted_on is
  'When this record began, where it began as a promotion from another.';


-- ---------------------------------------------------------------------------
-- 2. The portal reports the progression
-- ---------------------------------------------------------------------------

-- The signature gains three columns, and Postgres will not let a replacement
-- change a function's return type, so the old one is dropped first.
drop function if exists public.verify_credential(text);

create function public.verify_credential(p_query text)
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
     -- Current engagements first, then the most recent history.
     (m.credential_status = 'active') desc,
     m.joined_on desc nulls last,
     m.name
   limit 20;
$$;

revoke all on function public.verify_credential(text) from public;
grant execute on function public.verify_credential(text) to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 3. One-off: Kabita Adhikari
-- ---------------------------------------------------------------------------
-- She interned from January and joined the team in May. The export already
-- holds both, which is the right shape — they simply were not linked, the
-- internship was never closed off, and the surname is spelled two ways.

update public.members
   set credential_status = 'completed',
       ended_on          = date '2026-05-01'
 where id = '06f985a2-1c69-4a0c-af6d-e86f9dd9bcb5';

update public.members
   set name          = 'Kabita Adhikari',
       promoted_from = '06f985a2-1c69-4a0c-af6d-e86f9dd9bcb5',
       promoted_on   = date '2026-05-01',
       previous_type = 'intern',
       previous_role = 'Graphic Design',
       joined_on     = date '2026-05-01'
 where id = 'de3fcdd4-8e8c-4c26-87c2-0aa17e33b878';


-- ============================================================================
-- Check it worked. All should say true.
-- ============================================================================
select
  (select count(*) from information_schema.columns
     where table_schema = 'public' and table_name = 'members'
       and column_name in ('promoted_on', 'previous_role', 'previous_type', 'promoted_from')) = 4
    as columns_added,
  (select count(*) from public.verify_credential('Kabita')) = 2
    as kabita_has_both_credentials,
  (select count(*) from public.members
     where name = 'Kabita Adhikari' and credential_status = 'completed') = 1
    as internship_closed,
  (select count(*) from public.members where promoted_from is not null) = 1
    as promotion_linked;
