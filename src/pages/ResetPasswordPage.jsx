import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthChrome } from "../components/AuthChrome.jsx";
import { supabase } from "../lib/supabaseClient.js";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("The password confirmation does not match.");
      return;
    }

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
    setMessage("Your password is set. We've signed out all other sessions on this account. You'll be redirected to Workspace momentarily.");
  }

  return (
    <AuthChrome>
      <section className="auth-card">
        <p className="auth-card-eyebrow">§ Account Recovery</p>
        <h1>Set New Password</h1>
        <p className="sub">
          Choose a new password for <strong style={{ color: "var(--sol-text)" }}>your Solstein account</strong>.
          All other sessions will be signed out.
        </p>

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
              New Password
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

          <div className="field">
            <label className="field-label" htmlFor="rp-confirm">
              Confirm New Password
            </label>
            <input
              className="input"
              id="rp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Saving" : "Update Password"}
          </button>
        </form>

        <div className="aux">
          <Link to="/">Continue to Workspace</Link>
        </div>
      </section>
    </AuthChrome>
  );
}
