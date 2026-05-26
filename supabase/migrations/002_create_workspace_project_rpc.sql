-- Atomic project creation for the MVP workspace dashboard.

create or replace function public.create_workspace_project(
  target_workspace_id uuid,
  project_name text,
  project_description text default null
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_project public.projects;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_workspace_owner(target_workspace_id) then
    raise exception 'Not allowed to create projects in this workspace';
  end if;

  insert into public.projects (workspace_id, name, description, created_by)
  values (
    target_workspace_id,
    nullif(project_name, ''),
    project_description,
    current_user_id
  )
  returning * into new_project;

  insert into public.project_members (project_id, user_id, role)
  values (new_project.id, current_user_id, 'owner')
  on conflict (project_id, user_id) do update
    set role = excluded.role;

  return new_project;
end;
$$;
