-- Solstein MVP multi-tenant workspace foundation.
-- Apply in Supabase SQL editor or through Supabase migrations.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  is_operator boolean not null default false,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member', 'external')),
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'archived', 'deleted')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.graphs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_active_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  );
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
      and wm.status = 'active'
  );
$$;

create or replace function public.can_edit_project(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.projects p
    join public.project_members pm on pm.project_id = p.id
    join public.workspace_members wm on wm.workspace_id = p.workspace_id and wm.user_id = auth.uid()
    where p.id = target_project_id
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'editor')
      and wm.status = 'active'
  );
$$;

create or replace function public.bootstrap_user_workspace(workspace_name text default null)
returns table (workspace_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  user_email text;
  existing_workspace_id uuid;
  new_workspace_id uuid;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into user_email
  from auth.users
  where id = current_user_id;

  insert into public.profiles (user_id, email)
  values (current_user_id, coalesce(user_email, ''))
  on conflict (user_id) do update
    set email = excluded.email;

  select wm.workspace_id into existing_workspace_id
  from public.workspace_members wm
  where wm.user_id = current_user_id
    and wm.role = 'owner'
    and wm.status = 'active'
  order by wm.created_at asc
  limit 1;

  if existing_workspace_id is not null then
    workspace_id := existing_workspace_id;
    return next;
    return;
  end if;

  insert into public.workspaces (name, created_by)
  values (
    coalesce(nullif(workspace_name, ''), split_part(coalesce(user_email, 'My'), '@', 1) || '''s Workspace'),
    current_user_id
  )
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (new_workspace_id, current_user_id, 'owner', 'active');

  workspace_id := new_workspace_id;
  return next;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'workspaces',
    'workspace_members',
    'projects',
    'project_members',
    'graphs'
  ]
  loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.graphs enable row level security;

create policy "Users can read own profile"
on public.profiles for select
using (user_id = auth.uid());

create policy "Users can update own profile"
on public.profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Members can read workspaces"
on public.workspaces for select
using (public.is_active_workspace_member(id));

create policy "Owners can update workspaces"
on public.workspaces for update
using (public.is_workspace_owner(id))
with check (public.is_workspace_owner(id));

create policy "Members can read workspace memberships"
on public.workspace_members for select
using (public.is_active_workspace_member(workspace_id));

create policy "Owners can manage workspace memberships"
on public.workspace_members for all
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Members can read projects"
on public.projects for select
using (public.is_active_workspace_member(workspace_id));

create policy "Owners can create projects"
on public.projects for insert
with check (public.is_workspace_owner(workspace_id));

create policy "Owners can update projects"
on public.projects for update
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy "Workspace members can read project memberships"
on public.project_members for select
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_members.project_id
      and public.is_active_workspace_member(p.workspace_id)
  )
);

create policy "Workspace owners can manage project memberships"
on public.project_members for all
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_members.project_id
      and public.is_workspace_owner(p.workspace_id)
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_members.project_id
      and public.is_workspace_owner(p.workspace_id)
  )
);

create policy "Project members can read graphs"
on public.graphs for select
using (
  exists (
    select 1
    from public.projects p
    where p.id = graphs.project_id
      and public.is_active_workspace_member(p.workspace_id)
  )
);

create policy "Project editors can create graphs"
on public.graphs for insert
with check (public.can_edit_project(project_id));

create policy "Project editors can update graphs"
on public.graphs for update
using (public.can_edit_project(project_id))
with check (public.can_edit_project(project_id));
