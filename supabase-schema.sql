-- Run this in Supabase SQL Editor.
-- This resets only the content tables used by the admin panel.
-- Existing rows in these tables will be removed, so export them first if needed.

create extension if not exists "pgcrypto";

drop table if exists public.service_images cascade;
drop table if exists public.service_features cascade;
drop table if exists public.services cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.website_images cascade;
drop table if exists public.site_settings cascade;

create table public.services (
  id text primary key,
  icon text not null default 'service',
  icon_image text,
  title text not null,
  label text,
  heading text,
  description text not null default '',
  hero_image text,
  status text not null default 'active' check (status in ('active', 'coming_soon')),
  updated_at timestamptz not null default now()
);

create table public.service_images (
  id text primary key,
  service_id text not null references public.services(id) on delete cascade,
  label text,
  url text not null
);

create table public.service_features (
  id text primary key,
  service_id text not null references public.services(id) on delete cascade,
  icon text,
  image text,
  title text not null,
  description text not null,
  sort_order integer not null default 0
);

create table public.testimonials (
  id bigint primary key,
  name text not null,
  role text,
  company text,
  content text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  service text,
  photo text,
  certificate_image text,
  overview text,
  published_at timestamptz not null default now(),
  status text not null default 'published' check (status in ('published', 'draft'))
);

create table public.website_images (
  id text primary key,
  name text not null,
  used_in text,
  url text not null,
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.service_images enable row level security;
alter table public.service_features enable row level security;
alter table public.testimonials enable row level security;
alter table public.website_images enable row level security;
alter table public.site_settings enable row level security;

create policy "Public can read services" on public.services for select using (true);
create policy "Authenticated users manage services" on public.services for all to authenticated using (true) with check (true);

create policy "Public can read service images" on public.service_images for select using (true);
create policy "Authenticated users manage service images" on public.service_images for all to authenticated using (true) with check (true);

create policy "Public can read service features" on public.service_features for select using (true);
create policy "Authenticated users manage service features" on public.service_features for all to authenticated using (true) with check (true);

create policy "Public can read published testimonials" on public.testimonials for select using (status = 'published' or auth.role() = 'authenticated');
create policy "Authenticated users manage testimonials" on public.testimonials for all to authenticated using (true) with check (true);

create policy "Public can read website images" on public.website_images for select using (true);
create policy "Authenticated users manage website images" on public.website_images for all to authenticated using (true) with check (true);

create policy "Public can read site settings" on public.site_settings for select using (true);
create policy "Authenticated users manage site settings" on public.site_settings for all to authenticated using (true) with check (true);
