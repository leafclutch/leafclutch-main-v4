-- ============================================================================
-- Leafclutch Technologies — Starter Data (§18, §19, §13, §9, §21)
-- ============================================================================
-- Run this in the Supabase SQL Editor AFTER 1schema.sql.
-- Safe to re-run: every insert uses "on conflict do nothing", so it will never
-- overwrite values you have since edited in the admin panel.
--
-- This file deliberately seeds ONLY the tables the app has no built-in defaults
-- for. It does NOT touch services, company_services, testimonials or members —
-- the running app already ships demo content for those and will push it to the
-- database the first time you save from /admin.
--
-- NOTE: contact details below were read from the current website. Double-check
-- the address and business hours before going live.
-- ============================================================================


-- --- §19 Global website settings --------------------------------------------

insert into public.site_settings (key, value) values
  ('company_name',        'Leafclutch Technologies Pvt. Ltd.'),
  ('company_short_name',  'Leafclutch'),
  ('tagline',             'Technology, Innovation, Trust'),
  ('company_description', 'Leafclutch Technologies is a Nepal-based technology company delivering software development, digital marketing, design, training and SaaS products to businesses across the country.'),
  ('logo',                ''),
  ('favicon',             ''),
  ('email',               'info@leafclutchtech.com.np'),
  ('support_email',       'info@leafclutchtech.com.np'),
  ('phone',               '+977 9766715768'),
  ('phone_secondary',     ''),
  ('whatsapp',            '9779766715768'),
  ('address',             'Siddharthanagar, Rupandehi, Nepal'),
  ('address_line2',       ''),
  ('city',                'Siddharthanagar'),
  ('district',            'Rupandehi'),
  ('country',             'Nepal'),
  ('google_maps_embed',   ''),
  ('business_hours',      'Sunday – Friday, 9:00 AM – 6:00 PM'),
  ('business_hours_note', 'Closed on Saturdays and public holidays'),
  ('founded_year',        '2024'),
  ('training_site_url',   'https://leafclutchtech.com.np'),
  ('privacy_policy_url',  '/privacy-policy'),
  ('terms_url',           '/terms-and-conditions'),
  ('cookie_policy_url',   '/cookie-policy')
on conflict (key) do nothing;


-- --- §19 Social media links -------------------------------------------------

insert into public.social_links (id, platform, label, url, icon, sort_order) values
  ('facebook',  'Facebook',  'Facebook',  'https://www.facebook.com/profile.php?id=61584902195796', 'facebook',  1),
  ('instagram', 'Instagram', 'Instagram', 'https://www.instagram.com/leafclutch.technologies/',     'instagram', 2),
  ('linkedin',  'LinkedIn',  'LinkedIn',  'https://www.linkedin.com/company/leafclutch-technologies/', 'linkedin', 3),
  ('tiktok',    'TikTok',    'TikTok',    'https://www.tiktok.com/@leafclutchtechnologies',         'tiktok',    4),
  ('discord',   'Discord',   'Discord',   'https://discord.gg/4aDwcMZBPq',                          'discord',   5),
  ('whatsapp',  'WhatsApp',  'WhatsApp',  'https://wa.me/9779766715768',                            'whatsapp',  6),
  ('youtube',   'YouTube',   'YouTube',   '',                                                       'youtube',   7),
  ('x',         'X',         'X (Twitter)', '',                                                     'x',         8)
on conflict (id) do nothing;


-- --- §18 Homepage sections --------------------------------------------------
-- Toggle is_enabled / edit the copy / change sort_order from the admin panel.

insert into public.home_sections
  (id, name, title, subtitle, description, cta_label, cta_link, cta2_label, cta2_link, sort_order) values
  ('hero',         'Hero',                'Building Technology That Moves Nepal Forward',
                   'Leafclutch Technologies',
                   'Custom software, SaaS products, digital marketing and professional training — engineered in Nepal, built for businesses that want to grow.',
                   'Get Started', '/contact', 'Explore Services', '/services', 1),
  ('about',        'Company Introduction','Who We Are', 'About Leafclutch',
                   'We are a team of engineers, designers and marketers turning complex business problems into reliable digital products.',
                   'Learn More', '/about', null, null, 2),
  ('services',     'Services Overview',   'What We Do', 'Our Services',
                   'End-to-end technology services, from custom software to search engine optimization.',
                   'View All Services', '/services', null, null, 3),
  ('products',     'Products Overview',   'Our SaaS Products', 'Built by Leafclutch',
                   'Ready-to-use platforms for restaurants, hotels, schools and travel agencies.',
                   'View All Products', '/products', null, null, 4),
  ('why_choose_us','Why Choose Us',       'Why Businesses Choose Leafclutch', null,
                   'Experienced engineers, modern technology and long-term support.',
                   null, null, null, null, 5),
  ('stats',        'Statistics',          'Our Impact in Numbers', null, null, null, null, null, null, 6),
  ('portfolio',    'Portfolio',           'Our Work', 'Selected Projects',
                   'A look at the products and platforms we have delivered.',
                   'View Portfolio', '/portfolio', null, null, 7),
  ('testimonials', 'Testimonials',        'What Our Clients Say', null, null, null, null, null, null, 8),
  ('clients',      'Trusted Clients',     'Trusted by Growing Businesses', null, null, null, null, null, null, 9),
  ('blogs',        'Latest Blogs',        'From Our Blog', 'Insights & Updates',
                   'Practical writing on technology, business and building software in Nepal.',
                   'Read All Posts', '/blogs', null, null, 10),
  ('faq',          'FAQ Preview',         'Frequently Asked Questions', null,
                   'Answers to what clients ask us most.',
                   'See All FAQs', '/faq', null, null, 11),
  ('cta',          'Final CTA',           'Ready to Start Your Project?', null,
                   'Talk to our team and get a free consultation — no commitment required.',
                   'Get a Free Consultation', '/contact', 'WhatsApp Us', 'https://wa.me/9779766715768', 12)
on conflict (id) do nothing;


-- --- §3.6 Statistics --------------------------------------------------------

insert into public.stats (id, label, value, suffix, icon, context, sort_order) values
  ('projects',     'Projects Completed',    '50',   '+', 'briefcase',  'both', 1),
  ('clients',      'Happy Clients',         '30',   '+', 'users',      'both', 2),
  ('team',         'Team Members',          '15',   '+', 'user-group', 'both', 3),
  ('products',     'SaaS Products',         '4',    '',  'package',    'both', 4),
  ('trainees',     'Training Participants', '100',  '+', 'graduation', 'home', 5),
  ('uptime',       'Uptime',                '99.9', '%', 'activity',   'home', 6)
on conflict (id) do nothing;


-- --- §3.5 Why Choose Us -----------------------------------------------------

insert into public.why_choose_us (id, title, description, icon, sort_order) values
  ('experienced',  'Experienced Team',       'Engineers and designers who have shipped production systems used every day.', 'award',    1),
  ('modern-tech',  'Modern Technology',      'Current, well-supported stacks — not whatever was popular five years ago.',   'cpu',      2),
  ('custom',       'Customized Solutions',   'Built around how your business actually works, not a template forced to fit.', 'settings', 3),
  ('support',      'Reliable Support',       'We stay available after launch. Maintenance and fixes are part of the deal.',  'headset',  4),
  ('scalable',     'Scalable Solutions',     'Architecture that keeps working as your users and data grow.',                 'trending', 5),
  ('business',     'Business-Focused',       'We optimise for your outcomes — revenue, time saved, fewer errors.',           'target',   6)
on conflict (id) do nothing;


-- --- §4 Core values ---------------------------------------------------------

insert into public.core_values (id, title, description, icon, sort_order) values
  ('innovation',   'Innovation',            'We look for better ways to solve the problem, not just faster ways to close the ticket.', 'lightbulb', 1),
  ('trust',        'Trust & Transparency',  'Clear scope, clear pricing, honest timelines.',                                           'shield',    2),
  ('quality',      'Quality & Excellence',  'We ship work we are willing to put our name on.',                                          'star',      3),
  ('collaboration','Collaboration',         'We work with clients, not just for them.',                                                 'users',     4)
on conflict (id) do nothing;


-- --- §13 FAQ categories -----------------------------------------------------

insert into public.faq_categories (id, name, slug, sort_order) values
  ('general',    'General',    'general',    1),
  ('services',   'Services',   'services',   2),
  ('products',   'Products',   'products',   3),
  ('training',   'Training',   'training',   4),
  ('internship', 'Internship', 'internship', 5),
  ('pricing',    'Pricing',    'pricing',    6),
  ('support',    'Support',    'support',    7)
on conflict (id) do nothing;


-- --- §9 Blog categories -----------------------------------------------------

insert into public.blog_categories (id, name, slug, description, sort_order) values
  ('technology',       'Technology',        'technology',        'Engineering, tools and how we build.',           1),
  ('business',         'Business',          'business',          'Running and growing a business with software.',  2),
  ('digital-marketing','Digital Marketing', 'digital-marketing', 'SEO, social and content that actually works.',   3),
  ('design',           'Design',            'design',            'UI, UX and brand.',                              4),
  ('company-news',     'Company News',      'company-news',      'Announcements from the Leafclutch team.',        5),
  ('tutorials',        'Tutorials',         'tutorials',         'Step-by-step guides.',                           6)
on conflict (id) do nothing;


-- --- §21 Per-page SEO defaults ----------------------------------------------

insert into public.seo_settings (page_key, page_path, meta_title, meta_description) values
  ('home',      '/',                   'Leafclutch Technologies — Software, SaaS & Digital Services in Nepal',
                                       'Custom software development, SaaS products, digital marketing, design and professional IT training from Siddharthanagar, Nepal.'),
  ('about',     '/about',              'About Us — Leafclutch Technologies',
                                       'Who we are, what we build, and the team behind Leafclutch Technologies.'),
  ('services',  '/services',           'Our Services — Leafclutch Technologies',
                                       'Software development, web development, digital marketing, SEO, UI/UX design, graphic design, video editing and professional training.'),
  ('products',  '/products',           'Our Products — Leafclutch Technologies',
                                       'HRestroSewa, PragyaOS and more SaaS platforms built for restaurants, hotels, schools and travel businesses.'),
  ('portfolio', '/portfolio',          'Our Work — Leafclutch Technologies',
                                       'Case studies and projects delivered by Leafclutch Technologies.'),
  ('blogs',     '/blogs',              'Blog — Leafclutch Technologies',
                                       'Insights on technology, business and digital growth from the Leafclutch team.'),
  ('careers',   '/careers',            'Careers — Leafclutch Technologies',
                                       'Open roles and internships at Leafclutch Technologies in Siddharthanagar, Nepal.'),
  ('contact',   '/contact',            'Contact Us — Leafclutch Technologies',
                                       'Talk to our team about your project. Call, WhatsApp or send us a message.'),
  ('faq',       '/faq',                'FAQ — Leafclutch Technologies',
                                       'Answers to common questions about our services, products, pricing and support.'),
  ('verify',    '/verify-certificate', 'Verify Certificate — Leafclutch Technologies',
                                       'Check the authenticity of a certificate issued by Leafclutch Technologies.')
on conflict (page_key) do nothing;

-- ============================================================================
-- Done. Optionally run 4seed-demo-content.sql for sample blogs, jobs, FAQs,
-- portfolio projects, clients and the four real SaaS product records.
-- ============================================================================
