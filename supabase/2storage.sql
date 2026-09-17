-- ============================================================================
-- Leafclutch Technologies — Storage Buckets (§20 Media Management)
-- ============================================================================
-- Run this in the Supabase SQL Editor AFTER 1schema.sql.
-- Safe to re-run.
--
-- Two buckets:
--   media   -> public. Logos, product screenshots, blog covers, team photos.
--              Anyone can view the files; only signed-in admins can upload.
--   private -> not public. CVs/resumes from job applicants and certificate PDFs.
--              Only signed-in admins can read or write; the public never can.
-- ============================================================================

-- --- Buckets ---------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true,
  10485760,                                   -- 10 MB per file
  array[
    'image/jpeg','image/jpg','image/png','image/webp','image/gif',
    'image/svg+xml','image/avif','video/mp4','video/webm'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'private', 'private', false,
  10485760,                                   -- 10 MB per file
  array[
    'application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg','image/png','image/webp'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- --- Policies on the 'media' bucket -----------------------------------------
-- Public read so <img src> works without a signed URL; admin-only writes.

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media_admin_upload" on storage.objects;
create policy "media_admin_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');


-- --- Policies on the 'private' bucket ---------------------------------------
-- Job applicants upload a CV without an account, so anon may INSERT — but only
-- into the applications/ folder, and nobody anonymous can ever read it back.

drop policy if exists "private_applicant_upload" on storage.objects;
create policy "private_applicant_upload" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'private'
    and (storage.foldername(name))[1] = 'applications'
  );

drop policy if exists "private_admin_read" on storage.objects;
create policy "private_admin_read" on storage.objects
  for select to authenticated using (bucket_id = 'private');

drop policy if exists "private_admin_write" on storage.objects;
create policy "private_admin_write" on storage.objects
  for update to authenticated
  using (bucket_id = 'private') with check (bucket_id = 'private');

drop policy if exists "private_admin_delete" on storage.objects;
create policy "private_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'private');

-- ============================================================================
-- Suggested folder layout inside the 'media' bucket:
--   products/      blogs/        portfolio/     team/
--   services/      clients/      certificates/  general/
-- and inside 'private':
--   applications/  (CVs — required by the policy above)
-- ============================================================================
