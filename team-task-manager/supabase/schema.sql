-- ============================================================
-- TaskFlow - Team Task Manager
-- Supabase PostgreSQL Schema
-- ============================================================
-- Run this entire file in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with role and display info
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Projects policies
create policy "Admins can do everything with projects"
  on public.projects for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Members can view their projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.project_members
      where project_id = projects.id and user_id = auth.uid()
    )
  );

-- ============================================================
-- PROJECT_MEMBERS TABLE
-- ============================================================
create table if not exists public.project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz not null default now(),
  unique(project_id, user_id)
);

alter table public.project_members enable row level security;

create policy "Admins can manage project members"
  on public.project_members for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Members can view project membership"
  on public.project_members for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- TASKS TABLE
-- ============================================================
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  project_id uuid references public.projects(id) on delete cascade not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Admins can do everything with tasks"
  on public.tasks for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Members can view tasks assigned to them"
  on public.tasks for select
  using (assigned_to = auth.uid());

create policy "Members can update status of their own tasks"
  on public.tasks for update
  using (assigned_to = auth.uid())
  with check (assigned_to = auth.uid());

-- ============================================================
-- ACTIVITY LOGS TABLE
-- ============================================================
create table if not exists public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  entity_type text not null check (entity_type in ('task', 'project', 'member')),
  entity_id uuid not null,
  entity_name text not null,
  created_at timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

create policy "Authenticated users can view activity logs"
  on public.activity_logs for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert activity logs"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_project_members_user on public.project_members(user_id);
create index if not exists idx_project_members_project on public.project_members(project_id);
create index if not exists idx_activity_logs_user on public.activity_logs(user_id);
create index if not exists idx_activity_logs_created on public.activity_logs(created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_projects_updated_at
  before update on public.projects
  for each row execute procedure public.handle_updated_at();

create trigger handle_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- DEMO / SEED DATA
-- ============================================================
-- NOTE: Replace UUIDs with real user IDs after creating accounts.
-- Create accounts via the app first, then run this seed.

-- Example: After creating accounts, get user IDs from:
-- select id, email from auth.users;

-- Then insert sample projects/tasks:
-- insert into public.projects (name, description, owner_id) values
--   ('Website Redesign', 'Redesign the company marketing website', '<admin-user-id>'),
--   ('Mobile App', 'Build the iOS and Android app', '<admin-user-id>'),
--   ('API Integration', 'Integrate third-party payment APIs', '<admin-user-id>');
