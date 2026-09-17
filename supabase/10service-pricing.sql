-- ============================================================================
-- Leafclutch Technologies — Pricing plans for services
-- ============================================================================
-- Run this if your database was created before pricing became editable.
-- Safe to re-run; it does not touch existing rows.
--
-- public.services already has a `pricing` column. This adds the matching one
-- to public.company_services so service pages can have plans too.
--
-- Without it, saving pricing on a SERVICE fails silently
-- (console: 'company_services sync skipped'). Products are unaffected.
--
-- Already included in 1schema.sql — re-running that file works too.
-- ============================================================================

alter table public.company_services
  add column if not exists pricing jsonb not null default '[]'::jsonb;


-- --- Check it worked -------------------------------------------------------
-- EXPECTED: one row, data_type = jsonb.

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'company_services'
  and column_name = 'pricing';

-- ============================================================================
