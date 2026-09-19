-- ============================================================================
-- Leafclutch Technologies — Testimonial seed
-- Run after: 14security.sql
-- ============================================================================
-- The thirteen client testimonials collected in
-- public/Testimonials/Testimonials.txt.
--
-- Images were converted from the 735x525 PNGs in that folder to WebP and
-- uploaded to the `media` bucket under testimonials/ — 8.7 MB of PNG became
-- 0.96 MB. The rows below reference those uploads, so nothing image-related is
-- stored in the table itself.
--
-- Names written in mathematical-bold characters in the source file have been
-- folded to plain letters, which search engines and screen readers can read.
--
-- Safe to re-run: each row is upserted on its id.
-- ============================================================================

insert into public.testimonials
  (id, name, role, company, content, rating, service, photo, published_at, status)
values
  (2001, 'Red Wing Restaurant & Bar', 'Owner', 'Red Wing Restaurant & Bar',
   'HRestroSewa is one of the best restaurant management software. It is very easy to use and has made our daily work much simpler. Thank you, Leafclutch Technologies!',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/red-wing-restaurant-bar-1.webp', '2026-09-19T00:00:00Z', 'published'),
  (2002, 'Sungava Fast Food Restaurant', 'Owner', 'Sungava Fast Food Restaurant',
   'HRestroSewa has made managing our restaurant so much easier. Everything is simple, organized, and easy to understand. Highly recommended!',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/sungava-fast-food-restaurant-2.webp', '2026-09-19T00:00:00Z', 'published'),
  (2003, 'D Grand Butwal Cafe & Restaurant', 'Owner', 'D Grand Butwal Cafe & Restaurant',
   'We are very happy with HRestroSewa. The software is easy to use and helps us manage our restaurant operations smoothly. Thank you, Leafclutch Technologies!',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/d-grand-butwal-cafe-restaurant-3.webp', '2026-09-19T00:00:00Z', 'published'),
  (2004, 'Shubhalav Agro Resort', 'Owner', 'Shubhalav Agro Resort',
   'HRestroSewa is an excellent software for restaurants. It saves time, reduces manual work, and makes everything much more convenient.',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/shubhalav-agro-resort-4.webp', '2026-09-19T00:00:00Z', 'published'),
  (2005, 'Garden of Drinks', 'Owner', 'Garden of Drinks',
   'Managing our restaurant has become much easier after using HRestroSewa. The system is simple, fast, and user-friendly. Great work by Leafclutch Technologies!',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/garden-of-drinks-5.webp', '2026-09-19T00:00:00Z', 'published'),
  (2006, 'Mr. Manish Dhakal', 'Manager', 'Hotel Glasgow Inn & Restaurant',
   'HRestroSewa is really helpful for our daily restaurant operations. Everything is well organized and easy to manage. We are very satisfied with the software.',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/hotel-glasgow-inn-restaurant-6.webp', '2026-09-19T00:00:00Z', 'published'),
  (2007, 'Shining Crown Hotel & Restaurant', 'Owner', 'Shining Crown Hotel & Restaurant',
   'A very simple and effective restaurant management system. HRestroSewa has made our work easier and more efficient. Thank you, Leafclutch Technologies!',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/shining-crown-hotel-restaurant-7.webp', '2026-09-19T00:00:00Z', 'published'),
  (2008, 'Bhairahawa Food Cart', 'Owner', 'Bhairahawa Food Cart',
   'HRestroSewa is exactly what we needed for our restaurant. It is easy to operate and makes managing orders and daily activities much simpler.',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/bhairahawa-food-cart-8.webp', '2026-09-19T00:00:00Z', 'published'),
  (2009, 'Basecamp Garden Restaurant & Bar', 'Owner', 'Basecamp Garden Restaurant & Bar',
   'Great software for restaurant management! HRestroSewa is easy to understand, convenient to use, and has made our overall workflow much better.',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/basecamp-garden-restaurant-bar-9.webp', '2026-09-19T00:00:00Z', 'published'),
  (2010, 'The Classy Cafe', 'Owner', 'The Classy Cafe',
   'Thank you Leafclutch Technologies for creating HRestroSewa. It has simplified our restaurant management and made our everyday work much more organized.',
   5, 'HRestroSewa', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/the-classy-cafe-10.webp', '2026-09-19T00:00:00Z', 'published'),
  (2011, 'LIA', 'Principal', 'Lumbini Integrated Academy',
   'Really happy with their digital marketing and social media work. The content looks great, and they’re easy to work with. Highly recommended!',
   5, 'General', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/lumbini-integrated-academy-11.webp', '2026-09-19T00:00:00Z', 'published'),
  (2012, 'Kookoo Kids Collections', 'Owner', 'Kookoo Kids Collections',
   'Byapar Khata has made inventory management so much easier for us. It’s simple, easy to use, and keeps everything organized. Really happy with it!',
   5, 'General', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/kookoo-kids-collections-12.webp', '2026-09-19T00:00:00Z', 'published'),
  (2013, 'Lumbini Engineering, Management and Science College.', 'Principal', 'Lumbini Engineering, Management and Science College',
   'PragyaOS has made managing our college, library, and students much easier. Everything is organized in one place and very easy to use. Really happy with the system!',
   5, 'PragyaOS', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/testimonials/lumbini-engineering-management-and-scien-13.webp', '2026-09-19T00:00:00Z', 'published')
on conflict (id) do update set
  name         = excluded.name,
  role         = excluded.role,
  company      = excluded.company,
  content      = excluded.content,
  rating       = excluded.rating,
  service      = excluded.service,
  photo        = excluded.photo,
  published_at = excluded.published_at,
  status       = excluded.status;

-- ============================================================================
-- Check: should return 13, all published, every photo a bucket URL.
-- ============================================================================
select
  count(*)                                                       as seeded,
  count(*) filter (where status = 'published')                   as published,
  count(*) filter (where photo like '%/object/public/media/%')   as images_in_bucket
from public.testimonials
where id between 2001 and 2013;
