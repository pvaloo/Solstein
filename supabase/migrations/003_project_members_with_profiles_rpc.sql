-- Read project members with profile fields through the project workspace boundary.

create or replace function public.list_project_members_with_profiles(target_project_id uuid)
returns table (
  user_id uuid,
  role text,
  email text,
  full_name text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    pm.user_id,
    pm.role,
    p.email,
    p.full_name
  from public.project_members pm
  join public.projects pr on pr.id = pm.project_id
  left join public.profiles p on p.user_id = pm.user_id
  where pm.project_id = target_project_id
    and public.is_active_workspace_member(pr.workspace_id)
  order by pm.created_at asc;
$$;
