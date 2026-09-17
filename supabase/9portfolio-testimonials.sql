-- ============================================================================
-- Leafclutch Technologies — Our Work: testimonial columns
-- ============================================================================
-- Run this if your database was created before the Our Work admin panel.
-- Safe to re-run; it does not touch existing rows.
--
-- Without these, saving a project's testimonial from Admin > Our Work fails
-- silently (console: 'portfolio_projects sync skipped').
--
-- Already included in 1schema.sql — re-running that file works too.
-- ============================================================================

alter table public.portfolio_projects add column if not exists testimonial        text;
alter table public.portfolio_projects add column if not exists testimonial_author text;


-- --- Check it worked -------------------------------------------------------
-- EXPECTED: rows for both 'testimonial' and 'testimonial_author'.

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'portfolio_projects'
order by ordinal_position;

-- ============================================================================
