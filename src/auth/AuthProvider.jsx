import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./AuthContext.js";
import { supabase } from "../lib/supabaseClient.js";
import { bootstrapUserWorkspace } from "../lib/workspaceBootstrap.js";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [workspaceId, setWorkspaceId] = useState(null);
  const [bootstrapError, setBootstrapError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    async function bootstrapSession(nextSession) {
      if (!isMounted) return;
      setSession(nextSession ?? null);
      setBootstrapError(null);

      if (nextSession) {
        const { workspaceId: nextWorkspaceId, error } = await bootstrapUserWorkspace();
        if (!isMounted) return;
        setWorkspaceId(nextWorkspaceId);
        setBootstrapError(error);
      } else {
        setWorkspaceId(null);
      }

      setIsLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => {
      bootstrapSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") return;
      bootstrapSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      isConfigured: Boolean(supabase),
      bootstrapError,
      isLoading,
      session,
      user: session?.user ?? null,
      workspaceId,
      signOut,
    }),
    [bootstrapError, isLoading, session, signOut, workspaceId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
