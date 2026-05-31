import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthChrome, CrystalMark } from "../components/AuthChrome.jsx";
import { supabase } from "../lib/supabaseClient.js";

export function SignedOutPage() {
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.signOut();
  }, []);

  return (
    <AuthChrome>
      <section className="auth-card signed-out-card">
        <div className="signed-out-center">
          <CrystalMark size={56} />
          <p className="auth-card-eyebrow">§ Session Ended</p>
          <h1>You're Signed Out</h1>
          <p className="sub">
            Your Solstein session has been closed on this device. Sign back in to return to your
            workspace, or close this tab to finish.
          </p>

          <Link className="btn btn-primary signed-out-action" to="/sign-in">
            Sign In
          </Link>

          <div className="aux">
            Signed out by mistake? <Link to="/sign-in">Sign in again</Link>
          </div>
        </div>
      </section>
    </AuthChrome>
  );
}
