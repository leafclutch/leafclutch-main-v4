-- Run this in Supabase SQL Editor.
-- This resets only the content tables used by the admin panel.
-- Existing rows in these tables will be removed, so export them first if needed.

-- Needed for gen_random_uuid() / other crypto helpers, in case any table wants it later.
create extension if not exists "pgcrypto";

-- Wipe old versions of these tables first, so this script can be re-run safely.
-- "cascade" also drops anything that depends on them (like foreign keys below).
drop table if exists public.service_images cascade;
drop table if exists public.service_features cascade;
drop table if exists public.services cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.site_settings cascade;
drop table if exists public.members cascade;

-- One row per product/service shown on the site (Restaurant Management, IT Training, etc).
-- This is the main record edited from the admin panel's "Products" tab.
create table public.services (
  id text primary key,
  icon text not null default 'service',       -- emoji fallback icon if no icon_image is uploaded
  icon_image text,                             -- uploaded icon shown in nav/cards instead of the emoji
  title text not null,                         -- product name
  label text,                                  -- small uppercase label shown above the page heading
  heading text,                                -- big headline on the product's page
  description text not null default '',
  hero_image text,                             -- main banner/profile image for the product page
  status text not null default 'active' check (status in ('active', 'coming_soon')),
  updated_at timestamptz not null default now()
);

-- Extra gallery images for a product's page (hero slideshow images, screenshots, etc).
-- Each row belongs to one service via service_id.
create table public.service_images (
  id text primary key,
  service_id text not null references public.services(id) on delete cascade,
  label text,
  url text not null
);

-- The feature tiles shown on a product's page (e.g. "POS & Billing", "Inventory Management").
-- Each row belongs to one service via service_id; sort_order controls display order.
create table public.service_features (
  id text primary key,
  service_id text not null references public.services(id) on delete cascade,
  icon text,
  image text,
  title text not null,
  description text not null,
  sort_order integer not null default 0
);

-- Client reviews shown across the site (homepage + individual product pages).
-- "service" links a testimonial to one product by name (or "General" for site-wide reviews).
create table public.testimonials (
  id bigint primary key,
  name text not null,
  role text,
  company text,
  content text not null,                       -- the review text itself
  rating integer not null default 5 check (rating between 1 and 5),
  service text,
  photo text,
  certificate_image text,                       -- optional proof/certificate image for the review
  overview text,
  published_at timestamptz not null default now(),
  status text not null default 'published' check (status in ('published', 'draft'))
);

-- Generic key/value store for simple site settings the admin panel might save.
create table public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- People shown on the About Us page: founders, team members, and interns.
-- "type" decides which section a person appears in; sort_order controls their order within that section.
create table public.members (
  id text primary key,
  name text not null,
  role text,                                    -- job title / designation shown under the name
  photo text,
  linkedin text,                                 -- optional LinkedIn profile URL
  type text not null default 'team' check (type in ('founder', 'team', 'intern')),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Turn on Row Level Security for every table — without policies below, this blocks all access by default.
alter table public.services enable row level security;
alter table public.service_images enable row level security;
alter table public.service_features enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;
alter table public.members enable row level security;

-- Products: anyone can view them (public website); only logged-in admins can add/edit/delete.
create policy "Public can read services" on public.services for select using (true);
create policy "Authenticated users manage services" on public.services for all to authenticated using (true) with check (true);

-- Product gallery images: same rule — public can view, only admins can manage.
create policy "Public can read service images" on public.service_images for select using (true);
create policy "Authenticated users manage service images" on public.service_images for all to authenticated using (true) with check (true);

-- Product feature tiles: same rule — public can view, only admins can manage.
create policy "Public can read service features" on public.service_features for select using (true);
create policy "Authenticated users manage service features" on public.service_features for all to authenticated using (true) with check (true);

-- Testimonials: the public only sees "published" ones; admins (logged in) can see drafts too and manage all of them.
create policy "Public can read published testimonials" on public.testimonials for select using (status = 'published' or auth.role() = 'authenticated');
create policy "Authenticated users manage testimonials" on public.testimonials for all to authenticated using (true) with check (true);

-- Site settings: same rule — public can view, only admins can manage.
create policy "Public can read site settings" on public.site_settings for select using (true);
create policy "Authenticated users manage site settings" on public.site_settings for all to authenticated using (true) with check (true);

-- Members (founders/team/interns) shown on the About Us page: public can view, only admins can manage.
create policy "Public can read members" on public.members for select using (true);
create policy "Authenticated users manage members" on public.members for all to authenticated using (true) with check (true);
