-- ============================================================================
-- Leafclutch Technologies — drop the testimonial Instagram column
-- Run after: 12blog-posts.sql
-- ============================================================================
-- Images are uploaded to the `media` storage bucket now (see 2storage.sql) and
-- only their URL is stored, so the Instagram embed column is no longer used.
--
-- Safe to re-run, and safe if you never added the column.
-- ============================================================================

alter table public.testimonials
  drop column if exists embed_url;

-- ============================================================================
-- Done. Nothing else changes: `photo` and `certificate_image` still hold the
-- image reference, now a bucket URL rather than base64.
-- ============================================================================
