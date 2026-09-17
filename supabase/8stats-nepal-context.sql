-- ============================================================================
-- Leafclutch Technologies — Statistics: allow the 'nepal' context
-- ============================================================================
-- Run this if your database was created before the Nepal reach band became
-- editable from Admin > Statistics. Safe to re-run.
--
-- Without it, saving a statistic set to "Nepal reach band" fails
-- (console: 'stats sync skipped') because the CHECK constraint rejects it.
--
-- Already included in 1schema.sql — re-running that file works too.
-- ============================================================================

alter table public.stats drop constraint if exists stats_context_check;
alter table public.stats add  constraint stats_context_check
  check (context in ('home','about','both','nepal'));


-- --- Check it worked -------------------------------------------------------
-- EXPECTED: the definition should list all four contexts.

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.stats'::regclass and contype = 'c';

-- ============================================================================
