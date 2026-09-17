-- ============================================================================
-- ⚠  DANGER — DESTRUCTIVE  ⚠
-- Leafclutch Technologies — Full Database Reset
-- ============================================================================
-- This DROPS every Leafclutch table and DELETES ALL DATA in them: products,
-- blogs, job applications, contact enquiries, certificates — everything.
-- There is no undo.
--
-- You almost never need this. 1schema.sql is already safe to re-run and will
-- never delete data. Use this only to start a project completely over.
--
-- To actually run it, you must first execute this line on its own:
--
--     select set_config('leafclutch.confirm_reset', 'yes', false);
--
-- ...then run this whole file in the SAME SQL Editor tab/session.
-- After it finishes, run 1schema.sql -> 2storage.sql -> 3seed.sql again.
-- ============================================================================

do $$
begin
  if coalesce(current_setting('leafclutch.confirm_reset', true), '') <> 'yes' then
    raise exception
      'Reset not confirmed. Run this first, in the same session: select set_config(''leafclutch.confirm_reset'', ''yes'', false);';
  end if;
end;
$$;

-- Children first, then parents. "cascade" clears any leftover dependencies.
drop table if exists public.blog_post_tags      cascade;
drop table if exists public.blogs               cascade;
drop table if exists public.blog_tags           cascade;
drop table if exists public.blog_categories     cascade;
drop table if exists public.blog_authors        cascade;

drop table if exists public.job_applications    cascade;
drop table if exists public.jobs                cascade;

drop table if exists public.portfolio_images    cascade;
drop table if exists public.portfolio_projects  cascade;

drop table if exists public.faqs                cascade;
drop table if exists public.faq_categories      cascade;

drop table if exists public.certificates        cascade;
drop table if exists public.contact_enquiries   cascade;
drop table if exists public.clients             cascade;

drop table if exists public.service_images      cascade;
drop table if exists public.service_features    cascade;
drop table if exists public.services            cascade;
drop table if exists public.company_services    cascade;

drop table if exists public.testimonials        cascade;
drop table if exists public.website_images      cascade;
drop table if exists public.members             cascade;

drop table if exists public.home_sections       cascade;
drop table if exists public.stats               cascade;
drop table if exists public.why_choose_us       cascade;
drop table if exists public.core_values         cascade;

drop table if exists public.social_links        cascade;
drop table if exists public.seo_settings        cascade;
drop table if exists public.site_settings       cascade;
drop table if exists public.media               cascade;
drop table if exists public.admin_profiles      cascade;

-- Functions and the auth trigger.
drop trigger  if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_admin_user()      cascade;
drop function if exists public.admin_dashboard_counts()     cascade;
drop function if exists public.verify_certificate(text)     cascade;
drop function if exists public.generate_certificate_id()    cascade;
drop function if exists public.is_admin()                   cascade;
drop function if exists public.slugify(text)                cascade;
drop function if exists public.set_updated_at()             cascade;

-- Storage buckets are NOT dropped here — deleting a bucket with files in it
-- needs to be done from Supabase Dashboard -> Storage, on purpose.

-- ============================================================================
-- Reset complete. Now run: 1schema.sql -> 2storage.sql -> 3seed.sql
-- ============================================================================
