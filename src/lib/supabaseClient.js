import { createClient } from "@supabase/supabase-js";

function envValue(key, fallback) {
  const value = import.meta.env[key];
  if (!value) return fallback;
  const prefix = `${key}=`;
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

const supabaseUrl =
  envValue("VITE_SUPABASE_URL") ||
  "https://tzxkksmpxtlswnyrebew.supabase.co";
const supabaseKey =
  envValue("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  envValue("VITE_SUPABASE_ANON_KEY") ||
  "sb_publishable_TqzzsRBoPF7bNd4QmuUt2A_TtJfX_jG";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
