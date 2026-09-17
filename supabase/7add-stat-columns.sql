-- ============================================================================
-- Leafclutch Technologies — Statistics: unit + caption columns
-- ============================================================================
-- Run this if you set up the database before the Statistics admin panel existed.
-- Safe to re-run; it does not touch existing rows.
--
-- Without these columns, saving from Admin > Statistics fails silently
-- (console: 'stats sync skipped') and your edits never reach the database.
--
-- Already included in 1schema.sql — re-running that file works too.
-- ============================================================================

-- Word after the number on the home "Our Journey" cards, e.g. "50+ Projects".
alter table public.stats add column if not exists unit    text;

-- Longer line under those cards, e.g. "Successfully Delivered".
alter table public.stats add column if not exists caption text;


-- --- Check it worked -------------------------------------------------------
-- EXPECTED: rows for both 'unit' and 'caption'.

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'stats'
order by ordinal_position;

-- ============================================================================
