-- Infinite Canvas AI Agent — initial schema
-- Run in the Supabase SQL editor (or via the CLI). Idempotent where practical.
-- All user-owned tables use Row Level Security scoped to auth.uid().

create extension if not exists "pgcrypto";

-- ── Profiles ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Projects ────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists projects_user_id_idx on public.projects(user_id);

-- ── Canvases ────────────────────────────────────────────────────────────
-- `content` stores the full { nodes, edges } document for the canvas.
create table if not exists public.canvases (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  content     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists canvases_project_id_idx on public.canvases(project_id);
create index if not exists canvases_user_id_idx on public.canvases(user_id);

-- ── Images ──────────────────────────────────────────────────────────────
create table if not exists public.images (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  canvas_id    uuid references public.canvases(id) on delete set null,
  source       text not null check (source in ('upload', 'generated')),
  url          text not null,
  storage_path text,
  prompt       text,
  model        text,
  created_at   timestamptz not null default now()
);
create index if not exists images_user_id_idx on public.images(user_id);
create index if not exists images_canvas_id_idx on public.images(canvas_id);

-- ── updated_at maintenance ──────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists canvases_touch_updated_at on public.canvases;
create trigger canvases_touch_updated_at
  before update on public.canvases
  for each row execute function public.touch_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.canvases enable row level security;
alter table public.images enable row level security;

create policy "profiles are owned by user"
  on public.profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

create policy "projects are owned by user"
  on public.projects for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "canvases are owned by user"
  on public.canvases for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "images are owned by user"
  on public.images for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Storage bucket (public read so node image URLs are stable; per-user write) ─
-- MVP trade-off: public read means anyone with a URL can view an image. Writes
-- are still restricted to each user's folder. Make the bucket private + use
-- signed URLs later if image privacy is required.
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

create policy "users insert own uploads"
  on storage.objects for insert
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users update own uploads"
  on storage.objects for update
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete own uploads"
  on storage.objects for delete
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
