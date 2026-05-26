import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthChrome } from "../components/AuthChrome.jsx";
import { supabase } from "../lib/supabaseClient.js";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Your password has been updated. You can continue to the workspace.");
  }

  return (
    <AuthChrome>
      <section className="auth-card">
        <p className="auth-card-eyebrow">§ Account Recovery</p>
        <h1>Set Password</h1>
        <p className="sub">Choose a new password for your Solstein account.</p>

        {status === "error" ? (
          <div className="banner is-error">
            <div className="banner-mark" />
            <div className="banner-body">
              <span className="ban-title">Password update failed</span>
              {message}
            </div>
          </div>
        ) : null}

        {status === "success" ? (
          <div className="banner is-info">
            <div className="banner-mark" />
            <div className="banner-body">
              <span className="ban-title">Password updated</span>
              {message}
            </div>
          </div>
        ) : null}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="rp-password">
              New password
            </label>
            <input
              className="input"
              id="rp-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Saving" : "Save Password"}
          </button>
        </form>

        <div className="aux">
          <Link to="/">Continue to workspace</Link>
        </div>
      </section>
    </AuthChrome>
  );
}
