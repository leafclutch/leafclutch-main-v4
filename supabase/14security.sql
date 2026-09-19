-- ============================================================================
-- Leafclutch Technologies — Security hardening
-- Run after: 13storage-cleanup.sql
-- ============================================================================
-- Closes a path that let any stranger take over the site's content.
--
-- Before this file:
--   * every write policy was `to authenticated using (true)`, so ANY signed-in
--     account could insert, edit and delete every row on the site;
--   * the on-signup trigger gave every new auth user an ACTIVE super_admin
--     profile;
--   * `update_own_profile` let a user set their own `role` and `is_active`,
--     so even a restricted account could promote itself.
--
-- With Supabase sign-ups left open, that chain meant: register an account,
-- receive admin, rewrite the website. This file requires `public.is_admin()`
-- for every write, makes new accounts inactive, and stops anyone editing their
-- own role.
--
-- ALSO TURN SIGN-UPS OFF in the dashboard:
--   Authentication -> Providers -> Email -> disable "Enable sign ups".
-- This file cannot do that; it is a project setting, not schema.
--
-- Safe to re-run.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. New accounts are not administrators
-- ---------------------------------------------------------------------------
-- A profile row is still created so an account is easy to approve, but it is
-- inactive and holds the least privileged role, so `is_admin()` returns false
-- until someone deliberately turns it on.

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'content_manager',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- 2. Nobody can promote themselves
-- ---------------------------------------------------------------------------
-- Row-level security cannot restrict individual columns, so the privilege to
-- write `role` and `is_active` is removed at the column level instead. An
-- admin changes those through the dashboard or with the service-role key.

drop policy if exists "read_own_profile" on public.admin_profiles;
create policy "read_own_profile" on public.admin_profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "update_own_profile" on public.admin_profiles;
create policy "update_own_profile" on public.admin_profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

revoke update on public.admin_profiles from authenticated;
grant update (full_name, avatar, phone, last_login)
  on public.admin_profiles to authenticated;


-- ---------------------------------------------------------------------------
-- 3. Content tables: writes require an active admin
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
  public_tables text[] := array[
    'services', 'service_images', 'service_features', 'company_services',
    'website_images', 'site_settings', 'members',
    'blog_authors', 'blog_categories', 'blog_tags', 'blog_post_tags',
    'portfolio_images', 'faq_categories',
    'clients', 'home_sections', 'stats', 'why_choose_us', 'core_values',
    'social_links', 'seo_settings', 'media'
  ];
begin
  foreach t in array public_tables loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin_manage_%1$s" on public.%1$I', t);
    execute format(
      'create policy "admin_manage_%1$s" on public.%1$I
         for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end;
$$;


-- ---------------------------------------------------------------------------
-- 4. Tables with drafts: only admins see unpublished rows, and only admins write
-- ---------------------------------------------------------------------------
-- The old read policy revealed drafts to anyone merely signed in.

do $$
declare
  status_tables text[][] := array[
    array['testimonials',       'status = ''published'''],
    array['blogs',              'status = ''published'' and (published_at is null or published_at <= now())'],
    array['jobs',               'status = ''published'''],
    array['portfolio_projects', 'status = ''published'''],
    array['faqs',               'status = ''active''']
  ];
  i int;
  tbl text;
begin
  for i in 1 .. array_length(status_tables, 1) loop
    tbl := status_tables[i][1];
    if to_regclass('public.' || tbl) is null then
      continue;
    end if;
    execute format('alter table public.%I enable row level security', tbl);

    execute format('drop policy if exists "public_read_%1$s" on public.%1$I', tbl);
    execute format(
      'create policy "public_read_%1$s" on public.%1$I
         for select using (%2$s or public.is_admin())',
      tbl, status_tables[i][2]);

    execute format('drop policy if exists "admin_manage_%1$s" on public.%1$I', tbl);
    execute format(
      'create policy "admin_manage_%1$s" on public.%1$I
         for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', tbl);
  end loop;
end;
$$;


-- ---------------------------------------------------------------------------
-- 5. Visitor submissions stay submittable, but readable only by admins
-- ---------------------------------------------------------------------------

alter table public.contact_enquiries enable row level security;
drop policy if exists "admin_read_enquiries"   on public.contact_enquiries;
drop policy if exists "admin_update_enquiries" on public.contact_enquiries;
drop policy if exists "admin_delete_enquiries" on public.contact_enquiries;
create policy "admin_read_enquiries" on public.contact_enquiries
  for select to authenticated using (public.is_admin());
create policy "admin_update_enquiries" on public.contact_enquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_enquiries" on public.contact_enquiries
  for delete to authenticated using (public.is_admin());

alter table public.job_applications enable row level security;
drop policy if exists "admin_read_applications"   on public.job_applications;
drop policy if exists "admin_update_applications" on public.job_applications;
drop policy if exists "admin_delete_applications" on public.job_applications;
create policy "admin_read_applications" on public.job_applications
  for select to authenticated using (public.is_admin());
create policy "admin_update_applications" on public.job_applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_applications" on public.job_applications
  for delete to authenticated using (public.is_admin());

-- Certificates are looked up through verify_certificate(), which is security
-- definer, so the table itself does not need to be readable by the public.
alter table public.certificates enable row level security;
drop policy if exists "admin_manage_certificates" on public.certificates;
create policy "admin_manage_certificates" on public.certificates
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------------
-- 6. Storage: uploading and deleting media requires an active admin
-- ---------------------------------------------------------------------------
-- Reading stays public so <img src> works without a signed URL.

drop policy if exists "media_admin_upload" on storage.objects;
create policy "media_admin_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "private_admin_read" on storage.objects;
create policy "private_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'private' and public.is_admin());

drop policy if exists "private_admin_write" on storage.objects;
create policy "private_admin_write" on storage.objects
  for update to authenticated
  using (bucket_id = 'private' and public.is_admin())
  with check (bucket_id = 'private' and public.is_admin());

drop policy if exists "private_admin_delete" on storage.objects;
create policy "private_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'private' and public.is_admin());


-- ============================================================================
-- Check it worked. Every row should say true.
-- ============================================================================
select
  (select count(*) from public.admin_profiles where is_active) = 1
    as exactly_one_active_admin,
  (select count(*) from pg_policies
     where schemaname = 'public'
       and policyname like 'admin_manage_%'
       and qual not like '%is_admin%') = 0
    as every_write_policy_requires_admin;

-- ============================================================================
-- Remaining step, which cannot be done in SQL:
--   Authentication -> Providers -> Email -> turn OFF "Enable sign ups".
-- ============================================================================
