-- Atomic graph creation for a project the signed-in user can edit.

create or replace function public.create_project_graph(
  target_project_id uuid,
  graph_name text,
  graph_payload jsonb
)
returns public.graphs
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_graph public.graphs;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.can_edit_project(target_project_id) then
    raise exception 'Not allowed to create graphs in this project';
  end if;

  if jsonb_typeof(graph_payload -> 'nodes') <> 'array'
    or jsonb_typeof(graph_payload -> 'edges') <> 'array' then
    raise exception 'Graph payload must include nodes and edges arrays';
  end if;

  insert into public.graphs (project_id, name, payload, created_by)
  values (
    target_project_id,
    coalesce(nullif(graph_name, ''), 'Untitled graph'),
    graph_payload,
    current_user_id
  )
  returning * into new_graph;

  return new_graph;
end;
$$;
