-- ============================================================================
-- Leafclutch Technologies — Optional Demo / Starter Content
-- ============================================================================
-- Run this ONLY if you want real starting rows for the modules that have no
-- admin UI yet (blogs, careers, portfolio, FAQs, clients, certificates), plus
-- the four real SaaS products from req.md §6.
--
-- ⚠ READ BEFORE RUNNING THE PRODUCTS BLOCK
-- The website shows the built-in demo products (Restaurant Management, Pharmacy
-- Management, School Management, IT Training, ...) only while public.services is
-- EMPTY. The moment this file inserts rows there, those built-in demos stop
-- showing and the four products below take over — with no feature tiles or
-- gallery images until you add them in the admin panel.
-- If you would rather keep the current site exactly as it looks today, skip
-- section 1 and run the rest.
--
-- Everything uses "on conflict do nothing", so it is safe to re-run.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. §6 SaaS PRODUCTS  (skip this block if you want to keep the demo products)
-- ---------------------------------------------------------------------------

insert into public.services
  (id, slug, title, label, heading, icon, description, short_description, full_description,
   product_url, status, featured, sort_order, modules, technologies)
values
  ('hrestrosewa', 'hrestrosewa', 'HRestroSewa', 'RESTAURANT MANAGEMENT',
   'Run your entire restaurant from one screen', '🍽️',
   'Complete restaurant management with QR ordering, menu and table management, kitchen display and reporting.',
   'Complete restaurant management with QR ordering, menus, tables, kitchen and reports.',
   'HRestroSewa is an all-in-one restaurant platform. Guests order by scanning a QR code at the table, orders land straight in the kitchen, and owners see live sales, stock and staff performance from a single dashboard. Supports multiple outlets under one account.',
   'https://hrestrosewa.leafclutch.com.np/', 'active', true, 1,
   '["Restaurant management","QR ordering","Menu management","Order management","Table management","Kitchen management","Customer management","Reports","Admin dashboard","Multi-restaurant support"]'::jsonb,
   '["Next.js","Node.js","PostgreSQL","Supabase"]'::jsonb),

  ('hrestrosewa-hotel', 'hrestrosewa-hotel', 'HRestroSewa — Hotel Management', 'HOTEL MANAGEMENT',
   'Rooms, bookings and billing without the paperwork', '🏨',
   'Hotel management covering rooms, bookings, guests, billing, staff and check-in/check-out.',
   'Room, booking, guest, billing and staff management for hotels of any size.',
   'The hotel edition of HRestroSewa handles the full guest lifecycle — availability and room management, bookings, check-in and check-out, folio and billing, plus staff scheduling and management reports.',
   'https://hrestrosewa.leafclutch.com.np/', 'active', true, 2,
   '["Room management","Booking management","Guest management","Billing","Staff management","Reports","Check-in / check-out","Admin dashboard"]'::jsonb,
   '["Next.js","Node.js","PostgreSQL","Supabase"]'::jsonb),

  ('pragyaos', 'pragyaos', 'PragyaOS', 'SCHOOL MANAGEMENT SYSTEM',
   'One system for the whole school', '🎓',
   'School ERP covering students, teachers, attendance, assignments, timetables, library, notices and parent access.',
   'A complete school ERP for students, teachers, parents and administrators.',
   'PragyaOS brings the whole school onto one platform. Students and teachers get their own logins, parents get a portal, and administrators get attendance, timetables, assignments, library records, notices and reporting in one place.',
   'https://pragyaos.leafclutch.com.np/', 'active', true, 3,
   '["Student management","Teacher management","Library management","Attendance","Assignment upload","Timetable","Classes","Parent portal","Reports","Notices","Student login system","Teacher login system"]'::jsonb,
   '["Next.js","Node.js","PostgreSQL","Supabase"]'::jsonb),

  ('tours-and-travel', 'tours-and-travel', 'Tours & Travel Management System', 'TRAVEL MANAGEMENT',
   'Packages, bookings and payments in one place', '✈️',
   'Tour and travel management with packages, bookings, customers, itineraries, agents and payment tracking.',
   'Manage tour packages, bookings, itineraries, agents and payments.',
   'A management platform for travel agencies and tour operators — build and price packages, take bookings, track payments, publish itineraries and manage your agent network, with reporting across all of it.',
   null, 'coming_soon', false, 4,
   '["Tour / package management","Booking management","Customer management","Payment tracking","Travel itinerary","Agent management","Reports"]'::jsonb,
   '["Next.js","Node.js","PostgreSQL","Supabase"]'::jsonb)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 2. §13 Sample FAQs
-- ---------------------------------------------------------------------------

insert into public.faqs (id, category_id, question, answer, sort_order, show_on_home) values
  ('faq-what-we-do', 'general', 'What does Leafclutch Technologies do?',
   'We build custom software and websites, run digital marketing and SEO, handle design and video work, deliver professional IT training, and operate our own SaaS products such as HRestroSewa and PragyaOS.', 1, true),
  ('faq-where', 'general', 'Where are you located?',
   'Our office is in Siddharthanagar, Rupandehi, Nepal. We work with clients across Nepal and remotely.', 2, true),
  ('faq-timeline', 'services', 'How long does a project take?',
   'It depends on scope. A brochure website is usually 2–4 weeks; a custom software platform typically runs 2–6 months. We give you a firm timeline after the discovery call.', 1, true),
  ('faq-cost', 'pricing', 'How much does a project cost?',
   'Pricing depends on scope and complexity. Tell us what you need and we will send a written quote with a clear breakdown — no hidden charges.', 1, true),
  ('faq-demo', 'products', 'Can I try your SaaS products before buying?',
   'Yes. Contact us and we will set up a live demo of HRestroSewa or PragyaOS with sample data so you can try it properly.', 1, false),
  ('faq-support', 'support', 'Do you provide support after the project is delivered?',
   'Yes. Every project includes a support period, and we offer ongoing maintenance plans after that.', 1, false),
  ('faq-training-cert', 'training', 'Do I get a certificate after training?',
   'Yes. Every participant who completes a program receives a certificate, which anyone can check on our Verify Certificate page.', 1, false),
  ('faq-internship', 'internship', 'Do you offer internships?',
   'We do, in engineering, design and marketing. Open positions are listed on our Careers page.', 1, false)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 3. §16 Trusted clients / partners  (replace with your real clients)
-- ---------------------------------------------------------------------------

insert into public.clients (id, name, logo, website_url, sort_order) values
  ('client-sample-1', 'Sample Client One',   '', '', 1),
  ('client-sample-2', 'Sample Client Two',   '', '', 2),
  ('client-sample-3', 'Sample Client Three', '', '', 3)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 4. §9 Blog author + first post
-- ---------------------------------------------------------------------------

insert into public.blog_authors (id, name, role, bio) values
  ('leafclutch-team', 'Leafclutch Team', 'Leafclutch Technologies',
   'Writing from the Leafclutch engineering, design and marketing teams.')
on conflict (id) do nothing;

insert into public.blog_tags (id, name, slug) values
  ('nepal',    'Nepal',            'nepal'),
  ('startups', 'Startups',         'startups'),
  ('saas',     'SaaS',             'saas'),
  ('web',      'Web Development',  'web-development'),
  ('seo',      'SEO',              'seo')
on conflict (id) do nothing;

insert into public.blogs
  (id, slug, title, excerpt, content, author_id, category_id, status, published_at, read_minutes, show_on_home)
values
  ('welcome-to-leafclutch', 'welcome-to-leafclutch',
   'Welcome to the Leafclutch Blog',
   'Why we started writing, and what you can expect to read here.',
   E'## Welcome\n\nThis is the first post on the Leafclutch blog. We will be writing about the things we work on every day — building software in Nepal, running digital campaigns that actually convert, and the decisions behind our SaaS products.\n\n### What to expect\n\n- Practical engineering notes from real projects\n- Digital marketing and SEO that is measured, not guessed\n- Product updates for HRestroSewa and PragyaOS\n- Notes from our training programs\n\nYou can replace or delete this post from the admin panel at any time.',
   'leafclutch-team', 'company-news', 'published', now(), 2, true)
on conflict (id) do nothing;

insert into public.blog_post_tags (blog_id, tag_id) values
  ('welcome-to-leafclutch', 'nepal'),
  ('welcome-to-leafclutch', 'startups')
on conflict do nothing;


-- ---------------------------------------------------------------------------
-- 5. §8 Sample job posting
-- ---------------------------------------------------------------------------

insert into public.jobs
  (id, slug, title, department, location, employment_type, experience_level, openings,
   salary_text, description, responsibilities, requirements, benefits, skills,
   application_deadline, status, featured, sort_order)
values
  ('frontend-developer', 'frontend-developer', 'Frontend Developer',
   'Engineering', 'Siddharthanagar, Nepal (On-site)', 'full_time', '1–3 years', 1,
   'Negotiable, based on experience',
   'We are looking for a frontend developer to build fast, accessible interfaces for our client projects and SaaS products.',
   '["Build responsive interfaces in React and Next.js","Turn design files into production components","Work with backend engineers on API integration","Keep pages fast and accessible","Review teammates'' code"]'::jsonb,
   '["1+ year of React experience","Strong HTML, CSS and JavaScript fundamentals","Comfortable with Git","Able to read a design file and match it closely","Good written communication"]'::jsonb,
   '["Competitive salary","Flexible working hours","Paid training and certifications","Modern equipment","Friendly team"]'::jsonb,
   '["React","Next.js","TypeScript","Tailwind CSS","Git"]'::jsonb,
   (current_date + interval '45 days')::date, 'published', true, 1)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 6. §12 Sample portfolio project
-- ---------------------------------------------------------------------------

insert into public.portfolio_projects
  (id, slug, name, client_name, category, short_description, description,
   technologies, project_url, completion_date, status, featured, show_on_home, sort_order)
values
  ('hrestrosewa-platform', 'hrestrosewa-platform', 'HRestroSewa Restaurant Platform',
   'Leafclutch Technologies', 'SaaS Product',
   'A QR-ordering and restaurant management platform now running in live restaurants.',
   'We designed and built HRestroSewa end to end — QR-based table ordering, kitchen display, menu and inventory management, and an owner dashboard with live sales reporting. The platform supports multiple outlets under a single account.',
   '["Next.js","TypeScript","Node.js","PostgreSQL","Supabase","Tailwind CSS"]'::jsonb,
   'https://hrestrosewa.leafclutch.com.np/', current_date, 'published', true, true, 1)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 7. §11 Sample certificate (for testing the verification page)
-- ---------------------------------------------------------------------------
-- ⚠ DELETE THIS ROW BEFORE GOING LIVE:
--   delete from public.certificates where certificate_id = 'LCT-2026-SAMPLE';

insert into public.certificates
  (certificate_id, holder_name, program, certificate_type, grade, duration, mentor,
   issued_on, organization, status)
values
  ('LCT-2026-SAMPLE', 'John Doe', 'Professional Web Development Training',
   'training', 'A', '3 months', 'Leafclutch Training Team',
   current_date, 'Leafclutch Technologies Pvt. Ltd.', 'valid')
on conflict (certificate_id) do nothing;

-- Test it the way the website will:
--   select * from public.verify_certificate('John Doe');
--   select * from public.verify_certificate('LCT-2026-SAMPLE');

-- ============================================================================
-- Done.
-- ============================================================================
