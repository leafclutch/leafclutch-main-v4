-- ============================================================================
-- Leafclutch Technologies — group a person's credentials reliably
-- Run after: 19promotions.sql
-- ============================================================================
-- The portal needs to tell "these two credentials are one person, promoted"
-- from "these two credentials are two people with similar names". Matching on
-- the name cannot do that: Kabita's two records were spelled Adhikari and
-- Adhakari, so they read as different people.
--
-- verify_credential now returns `root_credential`, the credential at the start
-- of the promotion chain. Two records share it exactly when one was promoted
-- from the other, however the name happens to be typed.
--
-- Safe to re-run.
-- ============================================================================

-- One spelling. The link was already correct; the name was not.
update public.members
   set name = 'Kabita Adhikari'
 where id = 'de3fcdd4-8e8c-4c26-87c2-0aa17e33b878';


drop function if exists public.verify_credential(text);

create function public.verify_credential(p_query text)
returns table (
  credential_id   text,
  holder_name     text,
  role            text,
  member_type     text,
  photo           text,
  joined_on       date,
  ended_on        date,
  status          text,
  organization    text,
  promoted_on     date,
  previous_role   text,
  previous_type   text,
  root_credential text
)
language sql
stable
security definer
set search_path = public
as $$
  -- Walk each record back to the start of its promotion chain. Recursive
  -- rather than a single hop, so a second promotion still groups correctly.
  with recursive chain as (
    select m.id, m.id as root, m.promoted_from, 0 as depth
      from public.members m
    union all
    select c.id, p.id as root, p.promoted_from, c.depth + 1
      from chain c
      join public.members p on p.id = c.promoted_from
     where c.depth < 10
  ),
  roots as (
    select distinct on (id) id, root
      from chain
     order by id, depth desc
  ),
  q as (select btrim(coalesce(p_query, '')) as term)
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
         m.previous_type,
         coalesce(r.credential_id, m.credential_id)
    from public.members m
    cross join q
    left join roots     on roots.id = m.id
    left join public.members r on r.id = roots.root
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
     (m.credential_status = 'active') desc,
     m.joined_on desc nulls last,
     m.name
   limit 20;
$$;

revoke all on function public.verify_credential(text) from public;
grant execute on function public.verify_credential(text) to anon, authenticated;


-- ============================================================================
-- Check it worked. All should say true.
-- ============================================================================
select
  (select count(distinct name) from public.members where name ilike 'Kabita%') = 1
    as one_spelling,
  (select count(distinct root_credential) from public.verify_credential('Kabita')) = 1
    as both_share_one_chain,
  (select count(*) from public.verify_credential('Kabita')) = 2
    as still_two_credentials,
  (select count(distinct root_credential) from public.verify_credential('nepal')) = 2
    as different_people_stay_separate;
