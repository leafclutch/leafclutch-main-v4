-- ============================================================================
-- Leafclutch Technologies — Blog: author, category and tags columns
-- ============================================================================
-- Run this if your database was created before the Blogs admin panel.
-- Safe to re-run; it does not touch existing rows.
--
-- The table originally stored author and category as foreign keys and tags in
-- a join table. The admin panel writes them as plain values instead, which is
-- simpler to edit and is what the website reads.
--
-- Without these, saving a post's author, category or tags fails silently
-- (console: 'blogs sync skipped').
--
-- Already included in 1schema.sql — re-running that file works too.
-- ============================================================================

alter table public.blogs add column if not exists author   text;
alter table public.blogs add column if not exists category text;
alter table public.blogs add column if not exists tags     jsonb not null default '[]'::jsonb;


-- --- Check it worked -------------------------------------------------------
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'blogs'
  and column_name in ('author', 'category', 'tags');

-- ============================================================================
