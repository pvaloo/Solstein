-- Owner-only archive / restore lifecycle action for projects.

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
      and p.status = 'active'
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'editor')
      and wm.status = 'active'
  );
$$;

create or replace function public.set_project_status(
  target_project_id uuid,
  next_status text
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_project public.projects;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if next_status not in ('active', 'archived') then
    raise exception 'Unsupported project status';
  end if;

  if not public.is_project_owner(target_project_id) then
    raise exception 'Only project owners can change project lifecycle status';
  end if;

  update public.projects p
  set status = next_status
  where p.id = target_project_id
    and p.status <> 'deleted'
  returning * into updated_project;

  if updated_project.id is null then
    raise exception 'Project not found';
  end if;

  return updated_project;
end;
$$;
