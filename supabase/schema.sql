-- ============================================================================
-- BuildWithOsim — projects schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every statement is idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  -- named `description`, not `desc` — `desc` is a reserved SQL keyword
  description text        not null,
  link        text,
  repo_url    text,
  -- either a Supabase Storage public URL or a path into /public (e.g. /ssh.png)
  image_url   text,
  tools       text[]      not null default '{}',
  role        text,
  type        text,
  featured    boolean     not null default false,
  published   boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Public pages always read "published projects, in display order".
create index if not exists projects_published_sort_idx
  on public.projects (published, sort_order, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The database itself enforces access, so the public anon key can be shipped to
-- the browser without exposing writes.
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;

-- Anyone (including signed-out visitors) may read published projects only.
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
  on public.projects
  for select
  using (published = true);

-- Signed-in admins get full access. SELECT policies are OR'd, so an admin also
-- sees unpublished rows in the admin table.
drop policy if exists "projects_admin_all" on public.projects;
create policy "projects_admin_all"
  on public.projects
  for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for project screenshots
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Public read so images render on the public site.
drop policy if exists "project_images_public_read" on storage.objects;
create policy "project_images_public_read"
  on storage.objects
  for select
  using (bucket_id = 'project-images');

-- Only signed-in admins may add / replace / remove images.
drop policy if exists "project_images_admin_insert" on storage.objects;
create policy "project_images_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'project-images');

drop policy if exists "project_images_admin_update" on storage.objects;
create policy "project_images_admin_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'project-images');

drop policy if exists "project_images_admin_delete" on storage.objects;
create policy "project_images_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'project-images');

-- ---------------------------------------------------------------------------
-- Seed — the 8 projects previously hardcoded in utils/project-data.ts
--
-- sort_order preserves the order they were displayed in. Local images stay in
-- /public and are referenced by path.
-- ---------------------------------------------------------------------------
insert into public.projects
  (title, description, link, repo_url, image_url, tools, role, type, featured, published, sort_order)
values
  (
    'Recall',
    'A mobile app that helps users find and book rides easily, with real-time tracking and secure payments.',
    null, null, '/image.png',
    array['Nextjs', 'PWA'],
    'Solo porject (06/2026)', 'Customer Reminder', true, true, 1
  ),
  (
    'SoundSkill Hub',
    'An education and learning platform for music and sound skills, helping creatives grow their craft online.',
    'https://soundskillhub.com', null, '/ssh.png',
    array['Next.js', 'SEO Optimization', 'TypeScript'],
    'Solo Project(06/2026)', 'Education & Learning', true, true, 2
  ),
  (
    'Unikratives',
    'A business platform for creative entrepreneurs, showcasing services and digital products to grow their brand.',
    'https://www.unikratives.com', null, '/unikratives.webp',
    array['Next.js', 'SEO Optimization', 'TypeScript'],
    'Team Project @ 4onStudiosLTD(05/2026))', 'Business', true, true, 3
  ),
  (
    'Resume & CV Builder',
    'A mobile app that helps users create professional resumes quickly and stand out when applying for jobs.',
    'https://play.google.com/store/apps/details?id=com.fonstudios.cvbuilder', null,
    'https://play-lh.googleusercontent.com/vbPCVr3TotkXNNU8L361rWp2BlZl4Zvm6ZaHa9arv6Xbuoll7x-nSKimvzp3K0THiW56=w480-h960-rw',
    array['React Native', 'Mobile Development'],
    'Team Project @ 4onStudiosLTD(04/2025)', 'Productivity', false, true, 4
  ),
  (
    'CustomerApp & ParkManagerApp',
    'A booking platform that allows users to compare transport options and book tickets easily.',
    'https://move9ja.com/', null, '/image.png',
    array['React', 'Product Development', 'UI/UX'],
    'Team Project @ SmartWorks(09/2024)', 'Logistics', false, true, 5
  ),
  (
    'Kilobyte Studios',
    'A portfolio website of a professional graphics designer based in Africa.',
    'https://kilobyte-five.vercel.app/', null, '/kilobyted.png',
    array['Nextjs', 'Tailwind CSS', 'TypeScript'],
    'Solo Project(04/2026)', 'Personal Brand', false, true, 6
  ),
  (
    'Gimo Interiors',
    'Quality bedding, elegant curtains, and professional interior decoration services for your dream home.',
    'https://gimo-three.vercel.app/', null,
    'https://plus.unsplash.com/premium_photo-1670869816731-97a307d1c7ab?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmVkZGluZ3N8ZW58MHx8MHx8fDA%3D',
    array['Nextjs', 'Tailwind CSS', 'TypeScript'],
    'Solo Project(12/2025)', 'Business', false, true, 7
  ),
  (
    'RideSure Admin Panel',
    'An admin panel for RideSure, a ride-hailing service, built to manage drivers, rides, and users efficiently.',
    'https://www.adminridesure.com/login', null, '/ridesure.png',
    array['Full Stack Tools'],
    'Team Project @ SmartWorks(04/2025)', 'Management', false, true, 8
  )
on conflict do nothing;
