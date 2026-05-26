import { supabase } from "./supabaseClient.js";

export async function bootstrapUserWorkspace(workspaceName) {
  if (!supabase) {
    return { workspaceId: null, error: new Error("Supabase is not configured.") };
  }

  const { data, error } = await supabase.rpc("bootstrap_user_workspace", {
    workspace_name: workspaceName ?? null,
  });

  if (error) {
    return { workspaceId: null, error };
  }

  return { workspaceId: data?.[0]?.workspace_id ?? null, error: null };
}
