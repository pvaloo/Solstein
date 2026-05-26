import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthChrome } from "../components/AuthChrome.jsx";
import { supabase } from "../lib/supabaseClient.js";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL("/reset/recovery", window.location.origin).toString(),
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <AuthChrome>
      <section className="auth-card">
        {status === "sent" ? (
          <>
            <p className="auth-card-eyebrow">§ Account Recovery</p>
            <h1>Check Your Inbox</h1>
            <p className="sub">
              If an account exists for that email, a reset link has been sent. The link expires in{" "}
              <strong style={{ color: "var(--sol-text)" }}>15 minutes</strong>.
            </p>
            <dl className="auth-facts">
              <dt>Sent to</dt>
              <dd>{email}</dd>
              <dt>From</dt>
              <dd>no-reply@solstein.com</dd>
              <dt>Expires</dt>
              <dd>15 minutes from now</dd>
            </dl>
            <div className="aux">
              <Link to="/sign-in">Back to sign in</Link>
            </div>
          </>
        ) : (
          <>
            <p className="auth-card-eyebrow">§ Account Recovery</p>
            <h1>Reset Password</h1>
            <p className="sub">Enter your email and we'll send a link to set a new password.</p>

            {status === "error" ? (
              <div className="banner is-error">
                <div className="banner-mark" />
                <div className="banner-body">
                  <span className="ban-title">Reset failed</span>
                  {message}
                </div>
              </div>
            ) : null}

            <form className="form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label" htmlFor="fp-email">
                  Email
                </label>
                <input
                  className="input"
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Sending" : "Send Reset Link"}
              </button>
            </form>

            <div className="aux">
              <Link to="/sign-in">Back to sign in</Link>
            </div>
          </>
        )}
      </section>
    </AuthChrome>
  );
}
