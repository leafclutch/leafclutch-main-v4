-- ============================================================================
-- Leafclutch Technologies — Post-Setup Verification
-- ============================================================================
-- Read-only. Changes nothing. Run this after 1schema.sql + 2storage.sql + 3seed.sql
-- to confirm everything landed correctly.
-- Run the queries one at a time (the SQL Editor shows one result grid at a time).
-- ============================================================================


-- 1. Tables missing Row Level Security.
--    EXPECTED RESULT: "No rows returned". Anything listed here is a problem.
select tablename as table_without_rls
from pg_tables
where schemaname = 'public'
  and rowsecurity = false
order by tablename;


-- 2. Every table, its RLS status and how many policies it has.
--    EXPECTED: 30 rows, rls_enabled = true on all of them, policies >= 1.
select c.relname                as table_name,
       c.relrowsecurity         as rls_enabled,
       count(p.polname)::int    as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relrowsecurity asc, c.relname;


-- 3. Table count.  EXPECTED: 30
select count(*)::int as total_tables
from pg_tables
where schemaname = 'public';


-- 4. Functions installed.  EXPECTED: 7 rows —
--    admin_dashboard_counts, generate_certificate_id, handle_new_admin_user,
--    is_admin, set_updated_at, slugify, verify_certificate
select p.proname as function_name
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;


-- 5. updated_at triggers.  EXPECTED: one row per table that has an updated_at
--    column (25 of the 30 tables).
select c.relname as table_name, t.tgname as trigger_name
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and not t.tgisinternal
order by c.relname;


-- 6. Storage buckets.  EXPECTED: 'media' (public = true), 'private' (public = false)
select id, name, public, file_size_limit
from storage.buckets
order by id;


-- 7. Seed data landed.  EXPECTED: settings 24, socials 8, sections 12, stats 6,
--    faq_categories 7, blog_categories 6, seo_pages 10
select
  (select count(*) from public.site_settings)   as settings,
  (select count(*) from public.social_links)    as socials,
  (select count(*) from public.home_sections)   as sections,
  (select count(*) from public.stats)           as stats,
  (select count(*) from public.faq_categories)  as faq_categories,
  (select count(*) from public.blog_categories) as blog_categories,
  (select count(*) from public.seo_settings)    as seo_pages;


-- 8. Your admin account and its auto-created profile.
--    EXPECTED: one row, after you create the user in Authentication -> Users.
select id, email, full_name, role, is_active, created_at
from public.admin_profiles
order by created_at;


-- 9. Certificate verification works.
--    Returns the sample row if you ran 4seed-demo-content.sql, otherwise empty.
select * from public.verify_certificate('John Doe');


-- 10. Admin dashboard counters (this is what the admin panel will call).
select public.admin_dashboard_counts();

-- ============================================================================
