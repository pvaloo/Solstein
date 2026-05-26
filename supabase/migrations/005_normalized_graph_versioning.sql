-- Normalized editable graph storage with immutable revision snapshots.

alter table public.graphs
add column if not exists current_revision_id uuid,
add column if not exists dirty boolean not null default false;

create table if not exists public.graph_revisions (
  id uuid primary key default gen_random_uuid(),
  graph_id uuid not null references public.graphs(id) on delete cascade,
  revision_number integer not null,
  label text,
  payload jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (graph_id, revision_number)
);

create table if not exists public.graph_nodes (
  id uuid primary key default gen_random_uuid(),
  graph_id uuid not null references public.graphs(id) on delete cascade,
  node_key text not null,
  type text,
  label text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  position jsonb not null default '{}'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (graph_id, node_key)
);

create table if not exists public.graph_edges (
  id uuid primary key default gen_random_uuid(),
  graph_id uuid not null references public.graphs(id) on delete cascade,
  edge_key text not null,
  source_node_id uuid references public.graph_nodes(id) on delete cascade,
  target_node_id uuid references public.graph_nodes(id) on delete cascade,
  source_key text not null,
  target_key text not null,
  type text,
  label text,
  metadata jsonb not null default '{}'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (graph_id, edge_key)
);

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'graphs'
      and constraint_name = 'graphs_current_revision_id_fkey'
  ) then
    alter table public.graphs
    add constraint graphs_current_revision_id_fkey
    foreign key (current_revision_id)
    references public.graph_revisions(id)
    on delete set null;
  end if;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'graph_nodes',
    'graph_edges'
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

alter table public.graph_revisions enable row level security;
alter table public.graph_nodes enable row level security;
alter table public.graph_edges enable row level security;

drop policy if exists "Project members can read graph revisions" on public.graph_revisions;
drop policy if exists "Project editors can create graph revisions" on public.graph_revisions;
drop policy if exists "Project members can read graph nodes" on public.graph_nodes;
drop policy if exists "Project editors can manage graph nodes" on public.graph_nodes;
drop policy if exists "Project members can read graph edges" on public.graph_edges;
drop policy if exists "Project editors can manage graph edges" on public.graph_edges;

create policy "Project members can read graph revisions"
on public.graph_revisions for select
using (
  exists (
    select 1
    from public.graphs g
    join public.projects p on p.id = g.project_id
    where g.id = graph_revisions.graph_id
      and public.is_active_workspace_member(p.workspace_id)
  )
);

create policy "Project editors can create graph revisions"
on public.graph_revisions for insert
with check (
  exists (
    select 1
    from public.graphs g
    where g.id = graph_revisions.graph_id
      and public.can_edit_project(g.project_id)
  )
);

create policy "Project members can read graph nodes"
on public.graph_nodes for select
using (
  exists (
    select 1
    from public.graphs g
    join public.projects p on p.id = g.project_id
    where g.id = graph_nodes.graph_id
      and public.is_active_workspace_member(p.workspace_id)
  )
);

create policy "Project editors can manage graph nodes"
on public.graph_nodes for all
using (
  exists (
    select 1
    from public.graphs g
    where g.id = graph_nodes.graph_id
      and public.can_edit_project(g.project_id)
  )
)
with check (
  exists (
    select 1
    from public.graphs g
    where g.id = graph_nodes.graph_id
      and public.can_edit_project(g.project_id)
  )
);

create policy "Project members can read graph edges"
on public.graph_edges for select
using (
  exists (
    select 1
    from public.graphs g
    join public.projects p on p.id = g.project_id
    where g.id = graph_edges.graph_id
      and public.is_active_workspace_member(p.workspace_id)
  )
);

create policy "Project editors can manage graph edges"
on public.graph_edges for all
using (
  exists (
    select 1
    from public.graphs g
    where g.id = graph_edges.graph_id
      and public.can_edit_project(g.project_id)
  )
)
with check (
  exists (
    select 1
    from public.graphs g
    where g.id = graph_edges.graph_id
      and public.can_edit_project(g.project_id)
  )
);

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
  first_revision public.graph_revisions;
  node_item jsonb;
  edge_item jsonb;
  source_node uuid;
  target_node uuid;
  edge_index integer := 0;
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

  insert into public.graphs (project_id, name, payload, version, created_by)
  values (
    target_project_id,
    coalesce(nullif(graph_name, ''), 'Untitled graph'),
    graph_payload,
    1,
    current_user_id
  )
  returning * into new_graph;

  insert into public.graph_revisions (graph_id, revision_number, label, payload, created_by)
  values (new_graph.id, 1, 'Initial import', graph_payload, current_user_id)
  returning * into first_revision;

  update public.graphs
  set current_revision_id = first_revision.id
  where id = new_graph.id
  returning * into new_graph;

  for node_item in select * from jsonb_array_elements(graph_payload -> 'nodes')
  loop
    insert into public.graph_nodes (
      graph_id,
      node_key,
      type,
      label,
      description,
      metadata,
      position,
      raw
    )
    values (
      new_graph.id,
      coalesce(node_item ->> 'id', node_item ->> 'key'),
      node_item ->> 'type',
      coalesce(node_item ->> 'label', node_item ->> 'name', node_item ->> 'id'),
      node_item ->> 'description',
      coalesce(node_item -> 'metadata', '{}'::jsonb),
      coalesce(node_item -> 'position', node_item -> 'pos', '{}'::jsonb),
      node_item
    );
  end loop;

  for edge_item in select * from jsonb_array_elements(graph_payload -> 'edges')
  loop
    edge_index := edge_index + 1;

    select id into source_node
    from public.graph_nodes
    where graph_id = new_graph.id
      and node_key = coalesce(edge_item ->> 'from', edge_item ->> 'source', edge_item ->> 'sourceId');

    select id into target_node
    from public.graph_nodes
    where graph_id = new_graph.id
      and node_key = coalesce(edge_item ->> 'to', edge_item ->> 'target', edge_item ->> 'targetId');

    insert into public.graph_edges (
      graph_id,
      edge_key,
      source_node_id,
      target_node_id,
      source_key,
      target_key,
      type,
      label,
      metadata,
      raw
    )
    values (
      new_graph.id,
      coalesce(edge_item ->> 'id', 'edge-' || edge_index::text),
      source_node,
      target_node,
      coalesce(edge_item ->> 'from', edge_item ->> 'source', edge_item ->> 'sourceId'),
      coalesce(edge_item ->> 'to', edge_item ->> 'target', edge_item ->> 'targetId'),
      edge_item ->> 'type',
      coalesce(edge_item ->> 'label', edge_item ->> 'name'),
      coalesce(edge_item -> 'metadata', '{}'::jsonb),
      edge_item
    );
  end loop;

  return new_graph;
end;
$$;

create or replace function public.backfill_graph_normalized_storage()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  graph_record public.graphs;
  first_revision public.graph_revisions;
  node_item jsonb;
  edge_item jsonb;
  source_node uuid;
  target_node uuid;
  edge_index integer;
begin
  for graph_record in
    select *
    from public.graphs g
    where jsonb_typeof(g.payload -> 'nodes') = 'array'
      and jsonb_typeof(g.payload -> 'edges') = 'array'
      and not exists (
        select 1
        from public.graph_revisions gr
        where gr.graph_id = g.id
      )
  loop
    first_revision := null;

    insert into public.graph_revisions (graph_id, revision_number, label, payload, created_by)
    values (graph_record.id, graph_record.version, 'Backfilled import', graph_record.payload, graph_record.created_by)
    on conflict (graph_id, revision_number) do nothing
    returning * into first_revision;

    if first_revision.id is null then
      select *
      into first_revision
      from public.graph_revisions
      where graph_id = graph_record.id
        and revision_number = graph_record.version
      limit 1;
    end if;

    update public.graphs
    set current_revision_id = first_revision.id
    where id = graph_record.id
      and current_revision_id is null;

    for node_item in select * from jsonb_array_elements(graph_record.payload -> 'nodes')
    loop
      insert into public.graph_nodes (
        graph_id,
        node_key,
        type,
        label,
        description,
        metadata,
        position,
        raw
      )
      values (
        graph_record.id,
        coalesce(node_item ->> 'id', node_item ->> 'key'),
        node_item ->> 'type',
        coalesce(node_item ->> 'label', node_item ->> 'name', node_item ->> 'id'),
        node_item ->> 'description',
        coalesce(node_item -> 'metadata', '{}'::jsonb),
        coalesce(node_item -> 'position', node_item -> 'pos', '{}'::jsonb),
        node_item
      )
      on conflict (graph_id, node_key) do nothing;
    end loop;

    edge_index := 0;
    for edge_item in select * from jsonb_array_elements(graph_record.payload -> 'edges')
    loop
      edge_index := edge_index + 1;

      select id into source_node
      from public.graph_nodes
      where graph_id = graph_record.id
        and node_key = coalesce(edge_item ->> 'from', edge_item ->> 'source', edge_item ->> 'sourceId');

      select id into target_node
      from public.graph_nodes
      where graph_id = graph_record.id
        and node_key = coalesce(edge_item ->> 'to', edge_item ->> 'target', edge_item ->> 'targetId');

      insert into public.graph_edges (
        graph_id,
        edge_key,
        source_node_id,
        target_node_id,
        source_key,
        target_key,
        type,
        label,
        metadata,
        raw
      )
      values (
        graph_record.id,
        coalesce(edge_item ->> 'id', 'edge-' || edge_index::text),
        source_node,
        target_node,
        coalesce(edge_item ->> 'from', edge_item ->> 'source', edge_item ->> 'sourceId'),
        coalesce(edge_item ->> 'to', edge_item ->> 'target', edge_item ->> 'targetId'),
        edge_item ->> 'type',
        coalesce(edge_item ->> 'label', edge_item ->> 'name'),
        coalesce(edge_item -> 'metadata', '{}'::jsonb),
        edge_item
      )
      on conflict (graph_id, edge_key) do nothing;
    end loop;
  end loop;
end;
$$;

select public.backfill_graph_normalized_storage();

create or replace function public.get_graph_document(target_graph_id uuid)
returns table (
  id uuid,
  project_id uuid,
  name text,
  version integer,
  current_revision_id uuid,
  payload jsonb,
  nodes jsonb,
  edges jsonb,
  revisions jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select
    g.id,
    g.project_id,
    g.name,
    g.version,
    g.current_revision_id,
    g.payload,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', gn.id,
            'node_key', gn.node_key,
            'type', gn.type,
            'label', gn.label,
            'description', gn.description,
            'metadata', gn.metadata,
            'position', gn.position,
            'raw', gn.raw
          )
          order by gn.created_at
        )
        from public.graph_nodes gn
        where gn.graph_id = g.id
      ),
      '[]'::jsonb
    ) as nodes,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', ge.id,
            'edge_key', ge.edge_key,
            'source_node_id', ge.source_node_id,
            'target_node_id', ge.target_node_id,
            'source_key', ge.source_key,
            'target_key', ge.target_key,
            'type', ge.type,
            'label', ge.label,
            'metadata', ge.metadata,
            'raw', ge.raw
          )
          order by ge.created_at
        )
        from public.graph_edges ge
        where ge.graph_id = g.id
      ),
      '[]'::jsonb
    ) as edges,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', gr.id,
            'revision_number', gr.revision_number,
            'label', gr.label,
            'created_at', gr.created_at
          )
          order by gr.revision_number desc
        )
        from public.graph_revisions gr
        where gr.graph_id = g.id
      ),
      '[]'::jsonb
    ) as revisions
  from public.graphs g
  join public.projects p on p.id = g.project_id
  where g.id = target_graph_id
    and public.is_active_workspace_member(p.workspace_id);
$$;
