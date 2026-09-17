-- ============================================================================
-- Leafclutch Technologies — Add member contact/social links
-- ============================================================================
-- Run this in the Supabase SQL Editor if you set up the database before the
-- links editor existed. Safe to re-run, and it does not touch existing rows.
--
-- Without this column the admin panel appears to save links, but the Supabase
-- write fails silently (console: 'column "links" does not exist') and the links
-- disappear on reload.
--
-- Already covered by 1schema.sql — re-running that file works too.
-- ============================================================================

-- Each entry: { "id": "...", "platform": "linkedin", "url": "https://…", "visible": true }
-- platform is one of: linkedin, email, website, facebook, instagram, twitter,
--                     github, youtube, tiktok, whatsapp, other
alter table public.members
  add column if not exists links jsonb not null default '[]'::jsonb;

-- Optional single-value columns kept as a fallback for older rows.
alter table public.members add column if not exists website   text;
alter table public.members add column if not exists email     text;
alter table public.members add column if not exists facebook  text;
alter table public.members add column if not exists instagram text;
alter table public.members add column if not exists twitter   text;
alter table public.members add column if not exists github    text;


-- --- Check it worked -------------------------------------------------------
-- EXPECTED: a row for 'links' with data_type = jsonb.

select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'members'
order by ordinal_position;

-- ============================================================================
