import { supabase } from "./supabaseClient.js";

function normalizeProjectGraphCount(project) {
  const graphCount = Number(project.graphs?.[0]?.count ?? 0);
  const projectFields = { ...project };
  delete projectFields.graphs;

  return {
    ...projectFields,
    graph_count: graphCount,
  };
}

export async function listWorkspaceProjects(workspaceId) {
  if (!supabase) {
    return { projects: [], error: new Error("Supabase is not configured.") };
  }

  if (!workspaceId) {
    return { projects: [], error: null };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, workspace_id, name, description, status, created_at, updated_at, graphs(count)")
    .eq("workspace_id", workspaceId)
    .neq("status", "deleted")
    .order("updated_at", { ascending: false });

  return { projects: (data ?? []).map(normalizeProjectGraphCount), error };
}

export async function createWorkspaceProject(workspaceId, name, description) {
  if (!supabase) {
    return { project: null, error: new Error("Supabase is not configured.") };
  }

  const { data: project, error } = await supabase.rpc("create_workspace_project", {
    target_workspace_id: workspaceId,
    project_name: name,
    project_description: description ?? "Created from the workspace dashboard.",
  });

  return { project, error };
}

export async function getProject(projectId) {
  if (!supabase) {
    return { project: null, error: new Error("Supabase is not configured.") };
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, workspace_id, name, description, status, created_at, updated_at")
    .eq("id", projectId)
    .neq("status", "deleted")
    .single();

  return { project: data, error };
}

export async function listProjectGraphs(projectId) {
  if (!supabase) {
    return { graphs: [], error: new Error("Supabase is not configured.") };
  }

  const { data, error } = await supabase
    .from("graphs")
    .select("id, project_id, name, version, current_revision_id, dirty, payload, created_at, updated_at")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  return { graphs: data ?? [], error };
}

export async function getGraphDocument(graphId) {
  if (!supabase) {
    return { graph: null, error: new Error("Supabase is not configured.") };
  }

  const { data, error } = await supabase
    .rpc("get_graph_document", {
      target_graph_id: graphId,
    })
    .single();

  return { graph: data, error };
}

export async function listProjectMembers(projectId) {
  if (!supabase) {
    return { members: [], error: new Error("Supabase is not configured.") };
  }

  const { data, error } = await supabase.rpc("list_project_members_with_profiles", {
    target_project_id: projectId,
  });

  return { members: data ?? [], error };
}

export async function createProjectGraph(projectId, name, payload) {
  if (!supabase) {
    return { graph: null, error: new Error("Supabase is not configured.") };
  }

  const { data: graph, error } = await supabase.rpc("create_project_graph", {
    target_project_id: projectId,
    graph_name: name,
    graph_payload: payload,
  });

  return { graph, error };
}
