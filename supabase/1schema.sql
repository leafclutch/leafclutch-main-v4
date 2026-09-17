-- ============================================================================
-- Leafclutch Technologies — Full Database Schema (Supabase / PostgreSQL)
-- ============================================================================
-- Run this ONCE in the Supabase SQL Editor of your new project.
--
-- It is SAFE TO RE-RUN: every object is created with "if not exists" and every
-- policy is dropped before being recreated. Running it again will NOT delete
-- your data. (Use reset.sql if you deliberately want a clean wipe.)
--
-- Covers every entity in req.md:
--   §5  Services            §6/§7 Products        §8  Careers + Applications
--   §9  Blogs               §11 Certificates      §12 Portfolio
--   §13 FAQs                §14 Contact enquiries §15 Testimonials
--   §16 Clients/Partners    §18 Homepage sections §19 Global settings
--   §20 Media               §21 SEO               §22 Admin users/roles
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS & SHARED HELPERS
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- Keeps updated_at accurate without the app having to remember to send it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Turns "Software Development" into "software-development" for slug defaults.
create or replace function public.slugify(p_text text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(lower(coalesce(p_text, '')), '[^a-z0-9]+', '-', 'g')
  );
$$;


-- ---------------------------------------------------------------------------
-- 1. CORE CONTENT (already used by the current admin panel — do not rename)
-- ---------------------------------------------------------------------------

-- §6/§7 SaaS PRODUCTS. The admin panel's "Products" tab writes here.
-- Kept as "services" because the running app reads this table by that name.
create table if not exists public.services (
  id                text primary key,                 -- slug-style id, e.g. 'hrestrosewa'
  icon              text not null default 'service',  -- emoji fallback when no icon_image
  icon_image        text,                             -- uploaded icon for nav/cards
  title             text not null,                    -- product name
  label             text,                             -- small uppercase eyebrow label
  heading           text,                             -- big headline on the product page
  description       text not null default '',
  hero_image        text,                             -- main banner image
  status            text not null default 'active'
                      check (status in ('active', 'coming_soon', 'draft')),
  updated_at        timestamptz not null default now()
);

-- §7 extra product fields (added separately so existing installs keep working).
alter table public.services add column if not exists slug              text;
alter table public.services add column if not exists logo              text;
alter table public.services add column if not exists short_description text not null default '';
alter table public.services add column if not exists full_description  text not null default '';
alter table public.services add column if not exists product_url       text;   -- e.g. https://pragyaos.leafclutch.com.np/
alter table public.services add column if not exists demo_url          text;
alter table public.services add column if not exists demo_username     text;
alter table public.services add column if not exists demo_password     text;
alter table public.services add column if not exists modules           jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists benefits          jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists technologies      jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists pricing           jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists faqs              jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists cta_label         text;
alter table public.services add column if not exists cta_link          text;
alter table public.services add column if not exists seo_title         text;
alter table public.services add column if not exists seo_description   text;
alter table public.services add column if not exists seo_image         text;
alter table public.services add column if not exists featured          boolean not null default false;
alter table public.services add column if not exists show_on_home      boolean not null default true;
alter table public.services add column if not exists sort_order        integer not null default 0;

create unique index if not exists services_slug_key on public.services (slug) where slug is not null;
create index if not exists services_status_idx on public.services (status, sort_order);

-- Gallery / screenshot images belonging to one product.
create table if not exists public.service_images (
  id          text primary key,
  service_id  text not null references public.services(id) on delete cascade,
  label       text,
  url         text not null,
  sort_order  integer not null default 0
);
alter table public.service_images add column if not exists sort_order integer not null default 0;
create index if not exists service_images_service_idx on public.service_images (service_id, sort_order);

-- Feature tiles shown on a product page (e.g. "QR Ordering", "Table Management").
create table if not exists public.service_features (
  id          text primary key,
  service_id  text not null references public.services(id) on delete cascade,
  icon        text,
  image       text,
  title       text not null,
  description text not null,
  sort_order  integer not null default 0
);
create index if not exists service_features_service_idx on public.service_features (service_id, sort_order);

-- §5 COMPANY SERVICES (Software Development, Digital Marketing, SEO, ...).
create table if not exists public.company_services (
  id                text primary key,
  title             text not null,
  short_description text not null default '',
  full_description  text not null default '',
  icon              text not null default '💼',
  icon_image        text,
  cover_image       text,
  features          jsonb not null default '[]'::jsonb,
  benefits          jsonb not null default '[]'::jsonb,
  technologies      jsonb not null default '[]'::jsonb,
  workflow          jsonb not null default '[]'::jsonb,   -- [{step,title,description}]
  status            text not null default 'active' check (status in ('active', 'draft')),
  sort_order        integer not null default 0,
  updated_at        timestamptz not null default now()
);

alter table public.company_services add column if not exists slug            text;
alter table public.company_services add column if not exists faqs            jsonb not null default '[]'::jsonb;
alter table public.company_services add column if not exists cta_label       text;
alter table public.company_services add column if not exists cta_link        text;
alter table public.company_services add column if not exists seo_title       text;
alter table public.company_services add column if not exists seo_description text;
alter table public.company_services add column if not exists seo_image       text;
alter table public.company_services add column if not exists featured        boolean not null default false;
alter table public.company_services add column if not exists show_on_home    boolean not null default true;
-- Pricing tiers shown on the service page:
--   [{ "id","name","price","period","description","features":[],"featured":true }]
alter table public.company_services add column if not exists pricing         jsonb not null default '[]'::jsonb;

create unique index if not exists company_services_slug_key on public.company_services (slug) where slug is not null;
create index if not exists company_services_status_idx on public.company_services (status, sort_order);

-- §15 TESTIMONIALS (home, service, product, portfolio and training pages).
create table if not exists public.testimonials (
  id                bigint primary key,
  name              text not null,
  role              text,
  company           text,
  content           text not null,
  rating            integer not null default 5 check (rating between 1 and 5),
  service           text,                       -- product/service this review belongs to
  photo             text,
  certificate_image text,
  overview          text,
  published_at      timestamptz not null default now(),
  status            text not null default 'published' check (status in ('published', 'draft'))
);
alter table public.testimonials add column if not exists sort_order integer not null default 0;
alter table public.testimonials add column if not exists featured   boolean not null default false;
create index if not exists testimonials_status_idx on public.testimonials (status, sort_order);

-- §20 Sitewide images not tied to a single product (admin "Website Images" tab).
create table if not exists public.website_images (
  id         text primary key,
  name       text not null,
  used_in    text,
  url        text not null,
  updated_at timestamptz not null default now()
);

-- §19 Global settings, stored as simple key/value pairs.
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

-- §4 TEAM MEMBERS shown on About Us (founders / team / interns).
create table if not exists public.members (
  id         text primary key,
  name       text not null,
  role       text,
  photo      text,
  linkedin   text,
  type       text not null default 'team' check (type in ('founder', 'team', 'intern')),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.members add column if not exists bio       text;
alter table public.members add column if not exists email     text;
alter table public.members add column if not exists facebook  text;
alter table public.members add column if not exists instagram text;
alter table public.members add column if not exists twitter   text;
alter table public.members add column if not exists github    text;
alter table public.members add column if not exists website   text;
alter table public.members add column if not exists is_active boolean not null default true;
-- Contact/social buttons, each with its own show-on-website flag:
--   [{ "id": "...", "platform": "linkedin", "url": "https://…", "visible": true }]
-- The flat columns above are the legacy fallback for rows saved before this.
alter table public.members add column if not exists links     jsonb not null default '[]'::jsonb;
create index if not exists members_type_idx on public.members (type, sort_order);


-- ---------------------------------------------------------------------------
-- 2. BLOGS (§9)
-- ---------------------------------------------------------------------------

create table if not exists public.blog_authors (
  id         text primary key,
  name       text not null,
  role       text,
  photo      text,
  bio        text,
  email      text,
  linkedin   text,
  is_active  boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  integer not null default 0,
  status      text not null default 'active' check (status in ('active', 'draft')),
  updated_at  timestamptz not null default now()
);

create table if not exists public.blog_tags (
  id         text primary key,
  name       text not null,
  slug       text not null unique,
  updated_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id              text primary key,
  slug            text not null unique,
  title           text not null,
  excerpt         text not null default '',        -- short description on the listing card
  content         text not null default '',        -- markdown / rich text body
  featured_image  text,
  author_id       text references public.blog_authors(id) on delete set null,
  category_id     text references public.blog_categories(id) on delete set null,
  status          text not null default 'draft'
                    check (status in ('draft', 'published', 'scheduled')),
  published_at    timestamptz,                     -- set when status becomes 'published'
  scheduled_for   timestamptz,                     -- used when status = 'scheduled'
  read_minutes    integer not null default 3,
  view_count      integer not null default 0,
  featured        boolean not null default false,
  show_on_home    boolean not null default false,
  sort_order      integer not null default 0,
  seo_title       text,
  seo_description text,
  seo_image       text,
  canonical_url   text,
  no_index        boolean not null default false,
  keywords        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
-- The admin panel writes these directly rather than juggling foreign keys.
alter table public.blogs add column if not exists author   text;
alter table public.blogs add column if not exists category text;
alter table public.blogs add column if not exists tags     jsonb not null default '[]'::jsonb;

create index if not exists blogs_status_idx    on public.blogs (status, published_at desc);
create index if not exists blogs_category_idx  on public.blogs (category_id);
create index if not exists blogs_author_idx    on public.blogs (author_id);

-- Many-to-many: one blog has many tags, one tag is on many blogs.
create table if not exists public.blog_post_tags (
  blog_id text not null references public.blogs(id) on delete cascade,
  tag_id  text not null references public.blog_tags(id) on delete cascade,
  primary key (blog_id, tag_id)
);
create index if not exists blog_post_tags_tag_idx on public.blog_post_tags (tag_id);


-- ---------------------------------------------------------------------------
-- 3. CAREERS & JOB APPLICATIONS (§8)
-- ---------------------------------------------------------------------------

create table if not exists public.jobs (
  id                   text primary key,
  slug                 text not null unique,
  title                text not null,
  department           text,                       -- Engineering, Design, Marketing, ...
  location             text,                       -- Siddharthanagar / Remote / Hybrid
  employment_type      text not null default 'full_time'
                         check (employment_type in
                           ('full_time','part_time','contract','internship','freelance')),
  experience_level     text,                       -- 'Fresher', '1-3 years', ...
  openings             integer not null default 1,
  salary_min           numeric(12,2),
  salary_max           numeric(12,2),
  salary_currency      text not null default 'NPR',
  salary_text          text,                       -- free text, e.g. "Negotiable"
  description          text not null default '',
  responsibilities     jsonb not null default '[]'::jsonb,   -- ["Build features", ...]
  requirements         jsonb not null default '[]'::jsonb,
  benefits             jsonb not null default '[]'::jsonb,
  skills               jsonb not null default '[]'::jsonb,
  application_deadline date,
  apply_email          text,
  apply_url            text,                       -- external form, if not using the site form
  status               text not null default 'draft'
                         check (status in ('draft','published','closed')),
  featured             boolean not null default false,
  sort_order           integer not null default 0,
  seo_title            text,
  seo_description      text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists jobs_status_idx on public.jobs (status, sort_order);

-- Submitted by the public through the "Apply" form. Never publicly readable.
create table if not exists public.job_applications (
  id               uuid primary key default gen_random_uuid(),
  job_id           text references public.jobs(id) on delete set null,
  job_title        text,                            -- snapshot, survives job deletion
  full_name        text not null,
  email            text not null,
  phone            text,
  address          text,
  experience_years text,
  current_company  text,
  expected_salary  text,
  resume_url       text,                            -- file in the 'media' storage bucket
  portfolio_url    text,
  linkedin_url     text,
  cover_letter     text,
  status           text not null default 'new'
                     check (status in ('new','reviewing','shortlisted','interview','rejected','hired')),
  admin_notes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists job_applications_job_idx    on public.job_applications (job_id, created_at desc);
create index if not exists job_applications_status_idx on public.job_applications (status, created_at desc);


-- ---------------------------------------------------------------------------
-- 4. PORTFOLIO / OUR WORK (§12)
-- ---------------------------------------------------------------------------

create table if not exists public.portfolio_projects (
  id               text primary key,
  slug             text not null unique,
  name             text not null,
  client_name      text,
  category         text,                            -- Web App, Mobile App, Branding, ...
  short_description text not null default '',
  description      text not null default '',
  case_study       text,                            -- long-form markdown case study
  technologies     jsonb not null default '[]'::jsonb,
  cover_image      text,
  project_url      text,
  completion_date  date,
  status           text not null default 'draft' check (status in ('draft','published')),
  featured         boolean not null default false,
  show_on_home     boolean not null default false,
  sort_order       integer not null default 0,
  seo_title        text,
  seo_description  text,
  seo_image        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
-- What the client said about the work, shown on the /portfolio card.
alter table public.portfolio_projects add column if not exists testimonial        text;
alter table public.portfolio_projects add column if not exists testimonial_author text;

create index if not exists portfolio_status_idx on public.portfolio_projects (status, sort_order);

create table if not exists public.portfolio_images (
  id         text primary key,
  project_id text not null references public.portfolio_projects(id) on delete cascade,
  url        text not null,
  caption    text,
  sort_order integer not null default 0
);
create index if not exists portfolio_images_project_idx on public.portfolio_images (project_id, sort_order);


-- ---------------------------------------------------------------------------
-- 5. FAQ (§13)
-- ---------------------------------------------------------------------------

create table if not exists public.faq_categories (
  id         text primary key,
  name       text not null,
  slug       text not null unique,
  sort_order integer not null default 0,
  status     text not null default 'active' check (status in ('active','draft')),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id           text primary key,
  category_id  text references public.faq_categories(id) on delete set null,
  question     text not null,
  answer       text not null,
  sort_order   integer not null default 0,
  status       text not null default 'active' check (status in ('active','draft')),
  show_on_home boolean not null default false,
  updated_at   timestamptz not null default now()
);
create index if not exists faqs_category_idx on public.faqs (category_id, sort_order);
create index if not exists faqs_status_idx   on public.faqs (status, sort_order);


-- ---------------------------------------------------------------------------
-- 6. CERTIFICATE VERIFICATION (§11)
-- ---------------------------------------------------------------------------
-- The table itself is NOT readable by the public. Visitors verify through the
-- public.verify_certificate() function further down, which returns only safe
-- fields and never exposes emails or internal notes.

-- Builds ids like LCT-2026-4F9A21.
create or replace function public.generate_certificate_id()
returns text
language sql
volatile
as $$
  select 'LCT-' || to_char(now(), 'YYYY') || '-' ||
         upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
$$;

create table if not exists public.certificates (
  id               uuid primary key default gen_random_uuid(),
  certificate_id   text not null unique default public.generate_certificate_id(),
  holder_name      text not null,
  holder_email     text,
  holder_phone     text,
  program          text not null,                   -- course / training / service name
  certificate_type text not null default 'training' -- training, internship, completion, ...
                     check (certificate_type in ('training','internship','completion','participation','achievement','other')),
  grade            text,
  duration         text,                            -- "3 months", "60 hours"
  mentor           text,
  issued_on        date not null default current_date,
  expires_on       date,
  organization     text not null default 'Leafclutch Technologies Pvt. Ltd.',
  status           text not null default 'valid' check (status in ('valid','invalid','revoked')),
  revoked_reason   text,
  revoked_at       timestamptz,
  certificate_url  text,                            -- PDF / image of the certificate
  notes            text,                            -- internal only, never returned publicly
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists certificates_holder_idx on public.certificates (lower(holder_name));
create index if not exists certificates_status_idx on public.certificates (status, issued_on desc);


-- ---------------------------------------------------------------------------
-- 7. CONTACT ENQUIRIES (§14)
-- ---------------------------------------------------------------------------
-- Anyone may INSERT (the contact form). Only admins may read.

create table if not exists public.contact_enquiries (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  phone        text,
  subject      text,
  interest     text,                                -- selected service or product
  message      text not null,
  enquiry_type text not null default 'general'
                 check (enquiry_type in ('general','quote','consultation','support','partnership')),
  source       text,                                -- which page/form it came from
  status       text not null default 'new'
                 check (status in ('new','read','replied','closed','spam')),
  admin_notes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists contact_enquiries_status_idx on public.contact_enquiries (status, created_at desc);


-- ---------------------------------------------------------------------------
-- 8. TRUSTED CLIENTS / PARTNERS (§16)
-- ---------------------------------------------------------------------------

create table if not exists public.clients (
  id          text primary key,
  name        text not null,
  logo        text,
  website_url text,
  description text,
  sort_order  integer not null default 0,
  status      text not null default 'active' check (status in ('active','draft')),
  featured    boolean not null default false,
  updated_at  timestamptz not null default now()
);
create index if not exists clients_status_idx on public.clients (status, sort_order);


-- ---------------------------------------------------------------------------
-- 9. HOMEPAGE SECTIONS & STATISTICS (§3, §18)
-- ---------------------------------------------------------------------------
-- One row per homepage block. Admin can rename it, rewrite its copy, swap the
-- image, reorder it or switch it off — without touching the frontend code.

create table if not exists public.home_sections (
  id          text primary key,                     -- 'hero', 'about', 'services', ...
  name        text not null,                        -- label shown in the admin list
  title       text,
  subtitle    text,
  description text,
  image       text,
  cta_label   text,
  cta_link    text,
  cta2_label  text,
  cta2_link   text,
  content     jsonb not null default '{}'::jsonb,   -- section-specific extra fields
  is_enabled  boolean not null default true,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- §3.6 / §4 counters: Projects Completed, Clients, Team Members, ...
create table if not exists public.stats (
  id         text primary key,
  label      text not null,
  value      text not null,                         -- text so "100+" and "99.9%" both work
  suffix     text,
  icon       text,
  context    text not null default 'home' check (context in ('home','about','both','nepal')),
  sort_order integer not null default 0,
  status     text not null default 'active' check (status in ('active','draft')),
  updated_at timestamptz not null default now()
);
-- Word shown after the number on the home "Our Journey" cards, e.g. "Years".
alter table public.stats add column if not exists unit    text;
-- Longer line under those cards, e.g. "Trust Our Solutions".
alter table public.stats add column if not exists caption text;
-- 'nepal' drives the blue reach band on the home page. Replacing the constraint
-- is required for databases created before that context existed.
alter table public.stats drop constraint if exists stats_context_check;
alter table public.stats add  constraint stats_context_check
  check (context in ('home','about','both','nepal'));

-- §3.5 Why Choose Us cards.
create table if not exists public.why_choose_us (
  id          text primary key,
  title       text not null,
  description text not null default '',
  icon        text,
  image       text,
  sort_order  integer not null default 0,
  status      text not null default 'active' check (status in ('active','draft')),
  updated_at  timestamptz not null default now()
);

-- §4 Core values shown on About Us.
create table if not exists public.core_values (
  id          text primary key,
  title       text not null,
  description text not null default '',
  icon        text,
  sort_order  integer not null default 0,
  status      text not null default 'active' check (status in ('active','draft')),
  updated_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 10. SOCIAL LINKS & SEO (§19, §21)
-- ---------------------------------------------------------------------------

create table if not exists public.social_links (
  id         text primary key,                      -- 'facebook', 'linkedin', ...
  platform   text not null,
  label      text,
  url        text not null,
  icon       text,
  sort_order integer not null default 0,
  status     text not null default 'active' check (status in ('active','draft')),
  updated_at timestamptz not null default now()
);

-- Per-page SEO overrides. page_key is the route, e.g. 'home', 'about', 'contact'.
create table if not exists public.seo_settings (
  page_key        text primary key,
  page_path       text,                             -- '/', '/about', '/contact'
  meta_title      text,
  meta_description text,
  keywords        text,
  og_title        text,
  og_description  text,
  og_image        text,
  canonical_url   text,
  no_index        boolean not null default false,
  schema_json     jsonb,                            -- JSON-LD structured data
  updated_at      timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 11. MEDIA LIBRARY (§20)
-- ---------------------------------------------------------------------------
-- Index of everything uploaded to the 'media' storage bucket, so the admin can
-- browse and reuse files instead of re-uploading them.

create table if not exists public.media (
  id          text primary key,
  name        text not null,
  url         text not null,
  storage_path text,                                -- path inside the storage bucket
  alt_text    text,
  type        text not null default 'image'
                check (type in ('image','video','document','other')),
  mime_type   text,
  size_bytes  bigint,
  width       integer,
  height      integer,
  folder      text not null default 'general',
  tags        jsonb not null default '[]'::jsonb,
  uploaded_by uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists media_folder_idx on public.media (folder, created_at desc);
create index if not exists media_type_idx   on public.media (type, created_at desc);


-- ---------------------------------------------------------------------------
-- 12. ADMIN USERS & ROLES (§22)
-- ---------------------------------------------------------------------------
-- Extends Supabase's auth.users with a display profile and a role. Roles are
-- stored now so role-based permissions can be switched on later without a
-- migration; today every signed-in user has full admin access.

create table if not exists public.admin_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'super_admin'
               check (role in ('super_admin','content_manager','hr_manager','marketing_manager')),
  avatar     text,
  phone      text,
  is_active  boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every new auth user automatically gets a profile row.
create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin_user();

-- Helper for tightening policies later: `using (public.is_admin())`.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles p
    where p.id = auth.uid() and p.is_active
  );
$$;


-- ---------------------------------------------------------------------------
-- 13. PUBLIC FUNCTIONS
-- ---------------------------------------------------------------------------

-- §11 Certificate verification.
-- Call from the frontend with:
--   supabase.rpc('verify_certificate', { p_query: 'John Doe' })
-- Returns only presentable fields — holder_email, phone and internal notes are
-- never exposed, and the certificates table stays closed to anonymous reads.
create or replace function public.verify_certificate(p_query text)
returns table (
  certificate_id   text,
  holder_name      text,
  program          text,
  certificate_type text,
  grade            text,
  duration         text,
  mentor           text,
  issued_on        date,
  expires_on       date,
  organization     text,
  status           text,
  certificate_url  text
)
language sql
stable
security definer
set search_path = public
as $$
  select c.certificate_id, c.holder_name, c.program, c.certificate_type,
         c.grade, c.duration, c.mentor, c.issued_on, c.expires_on,
         c.organization, c.status, c.certificate_url
  from public.certificates c
  where length(trim(coalesce(p_query, ''))) >= 3
    and (
      lower(c.certificate_id) = lower(trim(p_query))
      or lower(c.holder_name) = lower(trim(p_query))
      or lower(c.holder_name) like lower(trim(p_query)) || '%'
    )
  order by c.issued_on desc
  limit 10;
$$;

-- §17 Dashboard counters in a single round trip (admins only).
create or replace function public.admin_dashboard_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'products',           (select count(*) from public.services),
    'services',           (select count(*) from public.company_services),
    'blogs',              (select count(*) from public.blogs),
    'published_blogs',    (select count(*) from public.blogs where status = 'published'),
    'portfolio_projects', (select count(*) from public.portfolio_projects),
    'jobs',               (select count(*) from public.jobs),
    'open_jobs',          (select count(*) from public.jobs where status = 'published'),
    'job_applications',   (select count(*) from public.job_applications),
    'new_applications',   (select count(*) from public.job_applications where status = 'new'),
    'certificates',       (select count(*) from public.certificates),
    'testimonials',       (select count(*) from public.testimonials),
    'clients',            (select count(*) from public.clients),
    'faqs',               (select count(*) from public.faqs),
    'members',            (select count(*) from public.members),
    'enquiries',          (select count(*) from public.contact_enquiries),
    'new_enquiries',      (select count(*) from public.contact_enquiries where status = 'new'),
    'media',              (select count(*) from public.media)
  );
$$;

-- Non-admins must not be able to probe these.
revoke all on function public.admin_dashboard_counts() from public, anon;
grant execute on function public.admin_dashboard_counts() to authenticated;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 14. updated_at TRIGGERS
-- ---------------------------------------------------------------------------
-- Attaches the set_updated_at() trigger to every public table that has an
-- updated_at column, so timestamps stay correct no matter how a row is written.

do $$
declare
  t text;
begin
  for t in
    select cl.relname
    from pg_class cl
    join pg_namespace n on n.oid = cl.relnamespace
    join pg_attribute a on a.attrelid = cl.oid
    where n.nspname = 'public'
      and cl.relkind = 'r'
      and a.attname = 'updated_at'
      and a.attnum > 0
      and not a.attisdropped
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;


-- ---------------------------------------------------------------------------
-- 15. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
-- Rule of thumb:
--   * Website content  -> anyone can READ, only signed-in admins can WRITE.
--   * Visitor submissions (enquiries, job applications) -> anyone can INSERT,
--     only signed-in admins can READ or change them.
--   * Certificates and admin profiles -> admins only; the public goes through
--     the verify_certificate() function instead.
--
-- Since the site has no public sign-up, "signed-in" means "an admin account you
-- created in Supabase Auth". Keep sign-ups DISABLED in
-- Supabase Dashboard -> Authentication -> Providers -> Email.

-- 15a. Standard tables: public read + authenticated write.
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
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "public_read_%1$s" on public.%1$I', t);
    execute format(
      'create policy "public_read_%1$s" on public.%1$I for select using (true)', t);

    execute format('drop policy if exists "admin_manage_%1$s" on public.%1$I', t);
    execute format(
      'create policy "admin_manage_%1$s" on public.%1$I
         for all to authenticated using (true) with check (true)', t);
  end loop;
end;
$$;

-- 15b. Tables where the public should only see PUBLISHED / ACTIVE rows.
do $$
declare
  rec record;
  status_tables text[][] := array[
    array['testimonials',       'status = ''published'''],
    array['blogs',              'status = ''published'' and (published_at is null or published_at <= now())'],
    array['jobs',               'status = ''published'''],
    array['portfolio_projects', 'status = ''published'''],
    array['faqs',               'status = ''active''']
  ];
  i int;
begin
  for i in 1 .. array_length(status_tables, 1) loop
    execute format('alter table public.%I enable row level security', status_tables[i][1]);

    execute format('drop policy if exists "public_read_%1$s" on public.%1$I', status_tables[i][1]);
    -- Admins (authenticated) also see drafts; visitors only see live rows.
    execute format(
      'create policy "public_read_%1$s" on public.%1$I
         for select using (%2$s or auth.role() = ''authenticated'')',
      status_tables[i][1], status_tables[i][2]);

    execute format('drop policy if exists "admin_manage_%1$s" on public.%1$I', status_tables[i][1]);
    execute format(
      'create policy "admin_manage_%1$s" on public.%1$I
         for all to authenticated using (true) with check (true)', status_tables[i][1]);
  end loop;
end;
$$;

-- 15c. Visitor submissions: anyone may INSERT, only admins may read/update.
alter table public.contact_enquiries enable row level security;
drop policy if exists "anyone_submit_enquiry" on public.contact_enquiries;
create policy "anyone_submit_enquiry" on public.contact_enquiries
  for insert to anon, authenticated with check (true);
drop policy if exists "admin_read_enquiries" on public.contact_enquiries;
create policy "admin_read_enquiries" on public.contact_enquiries
  for select to authenticated using (true);
drop policy if exists "admin_update_enquiries" on public.contact_enquiries;
create policy "admin_update_enquiries" on public.contact_enquiries
  for update to authenticated using (true) with check (true);
drop policy if exists "admin_delete_enquiries" on public.contact_enquiries;
create policy "admin_delete_enquiries" on public.contact_enquiries
  for delete to authenticated using (true);

alter table public.job_applications enable row level security;
drop policy if exists "anyone_submit_application" on public.job_applications;
create policy "anyone_submit_application" on public.job_applications
  for insert to anon, authenticated with check (true);
drop policy if exists "admin_read_applications" on public.job_applications;
create policy "admin_read_applications" on public.job_applications
  for select to authenticated using (true);
drop policy if exists "admin_update_applications" on public.job_applications;
create policy "admin_update_applications" on public.job_applications
  for update to authenticated using (true) with check (true);
drop policy if exists "admin_delete_applications" on public.job_applications;
create policy "admin_delete_applications" on public.job_applications
  for delete to authenticated using (true);

-- 15d. Certificates: admins only. Visitors use verify_certificate() instead.
alter table public.certificates enable row level security;
drop policy if exists "admin_manage_certificates" on public.certificates;
create policy "admin_manage_certificates" on public.certificates
  for all to authenticated using (true) with check (true);

-- 15e. Admin profiles: a user can read/update their own profile row.
alter table public.admin_profiles enable row level security;
drop policy if exists "read_own_profile" on public.admin_profiles;
create policy "read_own_profile" on public.admin_profiles
  for select to authenticated using (true);
drop policy if exists "update_own_profile" on public.admin_profiles;
create policy "update_own_profile" on public.admin_profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);


-- ---------------------------------------------------------------------------
-- 16. GRANTS
-- ---------------------------------------------------------------------------
-- Supabase normally grants these automatically; stated explicitly so the schema
-- also works when applied through the CLI or a non-default role.

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant insert on public.contact_enquiries, public.job_applications to anon;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Defense in depth: anonymous visitors must never be able to select from these,
-- regardless of RLS. (verify_certificate() still works — it is security definer.)
revoke select on public.certificates       from anon;
revoke select on public.contact_enquiries  from anon;
revoke select on public.job_applications   from anon;
revoke select on public.admin_profiles     from anon;
revoke all    on public.admin_profiles     from anon;

-- Row Level Security above is what actually decides who can touch what; these
-- grants only open the door for the policies to be evaluated.

-- ============================================================================
-- Done. Next: run 2storage.sql, then 3seed.sql.
-- ============================================================================
