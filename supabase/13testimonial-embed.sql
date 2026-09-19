-- ============================================================================
-- Leafclutch Technologies — Instagram embeds for testimonials
-- Run after: 12blog-posts.sql
-- ============================================================================
-- Testimonial photos are uploaded through the admin panel and stored as base64
-- inside `photo`, so one picture can add a few hundred kilobytes to every read
-- of this table. `embed_url` holds an Instagram permalink instead: a few dozen
-- characters, with the picture served by Instagram.
--
-- Safe to re-run. Nothing is deleted, and existing uploads keep working —
-- `photo` is still used whenever no embed is set.
-- ============================================================================

alter table public.testimonials
  add column if not exists embed_url text;

comment on column public.testimonials.embed_url is
  'Instagram post permalink shown in place of an uploaded photo, e.g. https://www.instagram.com/p/<code>/';

-- ============================================================================
-- Done. Existing rows are untouched and embed_url is null until one is set.
-- ============================================================================
