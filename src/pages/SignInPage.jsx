import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthChrome } from "../components/AuthChrome.jsx";
import { supabase } from "../lib/supabaseClient.js";

function authErrorMessage(error) {
  if (!error) return "";
  if (error.message?.toLowerCase().includes("invalid")) {
    return "The email and password combination is not recognised.";
  }
  return error.message ?? "Authentication failed. Try again.";
}

export function SignInPage({ operator = false }) {
  const location = useLocation();
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const redirectTo = useMemo(() => {
    const from = location.state?.from?.pathname;
    return new URL(from ?? (operator ? "/operator/" : "/"), window.location.origin).toString();
  }, [location.state?.from?.pathname, operator]);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
      return;
    }

    const result =
      mode === "sign-up"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectTo },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setStatus("error");
      setMessage(authErrorMessage(result.error));
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setStatus("success");
      setMessage("Check your inbox to confirm your email before signing in.");
      return;
    }

    setStatus("success");
    setMessage("Signed in. Redirecting...");
  }

  return (
    <AuthChrome>
      <section className="auth-card">
        <p className="auth-card-eyebrow">§ {operator ? "Operator Access" : "Workspace Access"}</p>
        <h1>{mode === "sign-up" ? "Create Account" : operator ? "Operator Sign In" : "Sign In"}</h1>
        <p className="sub">
          {mode === "sign-up"
            ? "Create your Solstein account for the MVP environment."
            : "Enter your credentials to continue."}
        </p>

        {status === "error" ? (
          <div className="banner is-error">
            <div className="banner-mark" />
            <div className="banner-body">
              <span className="ban-title">Authentication failed</span>
              {message}
            </div>
          </div>
        ) : null}

        {status === "success" ? (
          <div className="banner is-info">
            <div className="banner-mark" />
            <div className="banner-body">
              <span className="ban-title">{mode === "sign-up" ? "Confirm your email" : "Session active"}</span>
              {message}
            </div>
          </div>
        ) : null}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="si-email">
              Email
            </label>
            <input
              className="input"
              id="si-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="si-password">
              Password
            </label>
            <div className="pw-wrap">
              <input
                className="input"
                id="si-password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="pw-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((shown) => !shown)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {mode === "sign-in" ? (
            <div className="form-row" style={{ justifyContent: "flex-end" }}>
              <Link className="link" to="/forgot">
                Forgot password?
              </Link>
            </div>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Please wait" : mode === "sign-up" ? "Create Account" : "Sign In"}
          </button>
        </form>

        {!operator ? (
          <div className="aux">
            {mode === "sign-in" ? (
              <>
                New to Solstein?{" "}
                <button className="link-button" type="button" onClick={() => setMode("sign-up")}>
                  Create an MVP account
                </button>
              </>
            ) : (
              <>
                Already have access?{" "}
                <button className="link-button" type="button" onClick={() => setMode("sign-in")}>
                  Sign in
                </button>
              </>
            )}
          </div>
        ) : null}
      </section>
    </AuthChrome>
  );
}
