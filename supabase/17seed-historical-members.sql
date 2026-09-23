-- ============================================================================
-- Leafclutch Technologies — historical team and intern records
-- Run after: 16verification.sql
-- ============================================================================
-- 38 people from the previous system's members table
-- (members_rows.csv). Each is issued a credential ID by the trigger on insert,
-- so past interns can be verified on verify.leafclutch.com.np.
--
-- Seven names in that export are already in this database — the current team —
-- and are deliberately absent here. Re-importing them would overwrite live
-- photos and links with older values.
--
-- Deliberately NOT imported: date of birth, phone number, personal email and
-- company email. This table is readable by the public for anyone whose
-- visible_on_site is true, so it is the wrong place for personal contact
-- details. Keep them in the previous export, or ask for an admin-only table.
--
-- The five photographs that existed were copied into the media bucket; the
-- originals lived on a Supabase project unrelated to this one.
--
-- Safe to re-run: rows are keyed on the id they had in the old system.
-- ============================================================================

insert into public.members
  (id, name, role, photo, type, sort_order,
   joined_on, ended_on, credential_status, visible_on_site, links)
values
  ('037312b6-8950-4432-b09f-09d1d2b7dd72', 'Anuska Shakya', 'Python Programming', null, 'intern', 1001,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('0556dc8f-9623-4de3-9733-e2c257919af2', 'Esther Rai', 'Backend Development', null, 'intern', 1002,
   '2026-01-16', null, 'active', false, '[]'::jsonb),
  ('06f985a2-1c69-4a0c-af6d-e86f9dd9bcb5', 'Kabita Adhikari', 'Graphic Design', null, 'intern', 1003,
   '2026-01-16', null, 'active', false, '[]'::jsonb),
  ('183101d5-b224-45da-accf-04585d81a172', 'Nishan Dhakal', 'Fullstack Developer Intern', null, 'intern', 1004,
   '2026-01-13', '2026-04-30', 'completed', false, '[]'::jsonb),
  ('184a218c-85af-42e0-add5-e8481bd4bf52', 'Roshna Karki', 'Cybersecurity', null, 'intern', 1005,
   '2026-01-18', null, 'active', false, '[]'::jsonb),
  ('25ace28e-20d9-4532-8cc0-90ce21cae2d7', 'Adhiraj Rai', 'Cybersecurity', null, 'intern', 1006,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('2d0452d8-41a3-468b-9732-9809857873f8', 'Amit Niraula', 'Backend Developer Intern', null, 'intern', 1007,
   '2026-01-04', '2026-04-30', 'completed', false, '[]'::jsonb),
  ('316465aa-1692-44e4-bda1-a66848476038', 'Pradip Kunwar', 'Cybersecurity', null, 'intern', 1008,
   '2026-01-18', null, 'active', false, '[]'::jsonb),
  ('35b9509c-2bb7-47be-a839-f5f51c99dd35', 'Reshmi Rajchal', 'UI UX Intern', null, 'intern', 1009,
   '2025-12-10', '0206-03-12', 'completed', false, '[]'::jsonb),
  ('47afd932-8a9b-49c5-8917-b26d9b6f8701', 'Saina Khadka', 'frontend Developer', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/team/saina-khadka-47afd9.webp', 'team', 1001,
   '2025-12-17', null, 'active', false, '[]'::jsonb),
  ('54afedeb-730c-43e1-9bbd-9a145e76a4c9', 'Albina Shakil', 'Cybersecurity', null, 'intern', 1010,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('57a5a94a-e03d-46cd-9a9b-40b4ac44130a', 'Adhiraj Rai', 'Cybersecurity', null, 'intern', 1011,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('72a5b5e5-63ec-4f0f-b901-5811dad8e705', 'Pratibha Pokhrel', 'Cybersecurity', null, 'intern', 1012,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('78e917b5-98d9-4622-94fc-80fe5dfa2d8e', 'Simon Shrestha', 'UI/UX', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/team/simon-shrestha-78e917.webp', 'intern', 1013,
   '2026-01-18', null, 'active', true, '[]'::jsonb),
  ('7ec04232-1d7b-4d85-88fd-c495b9d2f13a', 'Yushika Guragain', 'UI UX Intern', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/team/yushika-guragain-7ec042.webp', 'intern', 1014,
   '2026-01-15', null, 'active', true, '[]'::jsonb),
  ('899cd0ba-1384-4ec4-8d80-30af075b7656', 'Pratibha Pokhrel', 'Cybersecurity', null, 'intern', 1015,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('975c55e3-e462-4ca4-8e73-da4a3a00aa6f', 'Neha Dhakal', 'Cybersecurity', null, 'intern', 1016,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('b3e2dd36-88b9-4ceb-98e2-f20ab5e101c0', 'Suham Pandey', 'Frontend Developer Intern', null, 'intern', 1017,
   '2026-05-16', null, 'active', false, '[]'::jsonb),
  ('b62fe70c-d527-4e97-9751-5141492c1e76', 'Ajaj Ahmed Thakurai', 'Fullstack Developer Intern', null, 'intern', 1018,
   '2026-01-07', '2026-04-30', 'completed', false, '[]'::jsonb),
  ('b63979dc-11d7-4002-a5d3-1f1410307fbd', 'Newton Gurung', 'Cybersecurity', null, 'intern', 1019,
   '2026-01-18', null, 'active', false, '[]'::jsonb),
  ('c46165b4-1954-4528-bafa-f1360c27579e', 'Ritika Basnet', 'Full Stack Development', null, 'intern', 1020,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('d0b252f9-9ff7-46d0-8032-d2594640ef18', 'Sangam Singh Dhami', 'Fullstack Developer Intern', null, 'intern', 1021,
   '2026-01-04', '2026-04-30', 'completed', false, '[]'::jsonb),
  ('d1d74fc5-3d5b-4a3a-8f7f-f316b412ab3a', 'Subin Gaire', 'Frontend Developer Intern', null, 'intern', 1022,
   '2026-05-16', '2026-08-16', 'completed', false, '[]'::jsonb),
  ('d706bd6e-e41b-4ab3-8f15-6e1aeb2dba07', 'Frosang Tamang', 'Cybersecurity', null, 'intern', 1023,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('d8dd7212-ede0-4873-a501-c8d77d679a35', 'Manisha Yadav', 'QA Intern', null, 'intern', 1024,
   '2026-05-16', null, 'active', false, '[]'::jsonb),
  ('da07d9c5-9a68-493d-a05f-df3b3902b023', 'Muksam Wanem Limbu', 'AI/ML', null, 'intern', 1025,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('de3fcdd4-8e8c-4c26-87c2-0aa17e33b878', 'Kabita Adhakari', 'Graphic Designer', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/team/kabita-adhakari-de3fcd.webp', 'team', 1002,
   '2026-05-01', null, 'active', false, '[]'::jsonb),
  ('df66cf8a-8c57-49f6-b73a-b4e8a6918936', 'Jeewan Lamsal', 'Full-stack Developer', null, 'intern', 1026,
   '2026-01-04', '2026-04-30', 'completed', false, '[]'::jsonb),
  ('e38af8a6-ef07-4b28-8bbc-f43153a46f94', 'Binita Limbu', 'Cybersecurity', null, 'intern', 1027,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('e5378c4e-2a1f-48a8-8814-0bd80799fe0e', 'Roshan Kr. Singh', 'AI, ML and Backend', 'https://ymmcfsamrcgceqnwvurt.supabase.co/storage/v1/object/public/media/team/roshan-kr-singh-e5378c.webp', 'team', 1003,
   '2025-12-17', null, 'active', false, '[]'::jsonb),
  ('e728cbca-a2c8-40c1-8de9-fe1e176be5a0', 'Priyanka Mangpahang Rai', 'Full Stack Development', null, 'intern', 1028,
   '2026-01-18', null, 'active', false, '[]'::jsonb),
  ('e8962844-077a-45ac-996d-3281e50ea7f4', 'Sayal Kulung Rai', 'Full Stack Development', null, 'intern', 1029,
   '2026-01-18', null, 'active', false, '[]'::jsonb),
  ('eeee88f3-f3fe-40ed-8f69-202865131fa6', 'Anuska Shakya', 'Python Programmer', null, 'intern', 1030,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('efca5150-2b28-4013-aec9-a93b7bb3df09', 'Basanta Khadka', 'Graphic Design', null, 'intern', 1031,
   '2026-01-16', null, 'active', false, '[]'::jsonb),
  ('f47ec895-a762-44e5-b3a1-ba45a1a62f18', 'Presha Shrestha', 'Frontend Development', null, 'intern', 1032,
   '2026-01-15', null, 'active', false, '[]'::jsonb),
  ('f8e6c32d-f45e-46a4-8c56-9219932bf288', 'Riman Tamang', 'Agentic AI', null, 'intern', 1033,
   '2026-01-16', null, 'active', false, '[]'::jsonb),
  ('f965be5f-72da-4e5f-a7db-2d83f62cc83a', 'Rejina Lama', 'Cybersecurity', null, 'intern', 1034,
   '2026-01-21', null, 'active', false, '[]'::jsonb),
  ('fbc740cb-36d5-45a1-a27e-56b89fcc122b', 'Tina Ghale', 'Cybersecurity', null, 'intern', 1035,
   '2026-01-15', '2026-05-19', 'completed', false, '[]'::jsonb)
on conflict (id) do update set
  name              = excluded.name,
  role              = excluded.role,
  photo             = excluded.photo,
  type              = excluded.type,
  joined_on         = excluded.joined_on,
  ended_on          = excluded.ended_on,
  credential_status = excluded.credential_status,
  visible_on_site   = excluded.visible_on_site,
  links             = excluded.links;

-- ============================================================================
-- Check: every imported row should hold a credential.
-- ============================================================================
select count(*) as imported,
       count(*) filter (where credential_id is not null) as with_credential,
       count(*) filter (where type = 'intern') as interns,
       count(*) filter (where visible_on_site) as visible
from public.members
where id in ('037312b6-8950-4432-b09f-09d1d2b7dd72', '0556dc8f-9623-4de3-9733-e2c257919af2', '06f985a2-1c69-4a0c-af6d-e86f9dd9bcb5', '183101d5-b224-45da-accf-04585d81a172', '184a218c-85af-42e0-add5-e8481bd4bf52', '25ace28e-20d9-4532-8cc0-90ce21cae2d7', '2d0452d8-41a3-468b-9732-9809857873f8', '316465aa-1692-44e4-bda1-a66848476038', '35b9509c-2bb7-47be-a839-f5f51c99dd35', '47afd932-8a9b-49c5-8917-b26d9b6f8701', '54afedeb-730c-43e1-9bbd-9a145e76a4c9', '57a5a94a-e03d-46cd-9a9b-40b4ac44130a', '72a5b5e5-63ec-4f0f-b901-5811dad8e705', '78e917b5-98d9-4622-94fc-80fe5dfa2d8e', '7ec04232-1d7b-4d85-88fd-c495b9d2f13a', '899cd0ba-1384-4ec4-8d80-30af075b7656', '975c55e3-e462-4ca4-8e73-da4a3a00aa6f', 'b3e2dd36-88b9-4ceb-98e2-f20ab5e101c0', 'b62fe70c-d527-4e97-9751-5141492c1e76', 'b63979dc-11d7-4002-a5d3-1f1410307fbd', 'c46165b4-1954-4528-bafa-f1360c27579e', 'd0b252f9-9ff7-46d0-8032-d2594640ef18', 'd1d74fc5-3d5b-4a3a-8f7f-f316b412ab3a', 'd706bd6e-e41b-4ab3-8f15-6e1aeb2dba07', 'd8dd7212-ede0-4873-a501-c8d77d679a35', 'da07d9c5-9a68-493d-a05f-df3b3902b023', 'de3fcdd4-8e8c-4c26-87c2-0aa17e33b878', 'df66cf8a-8c57-49f6-b73a-b4e8a6918936', 'e38af8a6-ef07-4b28-8bbc-f43153a46f94', 'e5378c4e-2a1f-48a8-8814-0bd80799fe0e', 'e728cbca-a2c8-40c1-8de9-fe1e176be5a0', 'e8962844-077a-45ac-996d-3281e50ea7f4', 'eeee88f3-f3fe-40ed-8f69-202865131fa6', 'efca5150-2b28-4013-aec9-a93b7bb3df09', 'f47ec895-a762-44e5-b3a1-ba45a1a62f18', 'f8e6c32d-f45e-46a4-8c56-9219932bf288', 'f965be5f-72da-4e5f-a7db-2d83f62cc83a', 'fbc740cb-36d5-45a1-a27e-56b89fcc122b');
