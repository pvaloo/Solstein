import { supabase } from "./supabaseClient.js";

function unavailableError() {
  return new Error("Supabase is not configured.");
}

export async function getOwnProfile(userId) {
  if (!supabase) {
    return { profile: null, error: unavailableError() };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, email, full_name, avatar_url, created_at, updated_at")
    .eq("user_id", userId)
    .single();

  return { profile: data, error };
}

export async function updateOwnProfile(userId, fields) {
  if (!supabase) {
    return { profile: null, error: unavailableError() };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("user_id", userId)
    .select("user_id, email, full_name, avatar_url, created_at, updated_at")
    .single();

  return { profile: data, error };
}

export async function updateAccountPassword(password) {
  if (!supabase) {
    return { error: unavailableError() };
  }

  const { error } = await supabase.auth.updateUser({ password });

  return { error };
}
