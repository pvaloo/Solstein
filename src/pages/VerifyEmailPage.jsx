import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AuthChrome } from "../components/AuthChrome.jsx";
import { supabase } from "../lib/supabaseClient.js";

function readEmail(value) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function VerifyEmailPage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("sent");
  const [message, setMessage] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const verification = useMemo(() => {
    const tokenHash = searchParams.get("token_hash") || (token && token !== "sent" ? token : "");
    return {
      tokenHash,
      type: searchParams.get("type") || "email_change",
      newEmail: readEmail(searchParams.get("email") || searchParams.get("new_email")),
      previousEmail: readEmail(searchParams.get("previous_email")),
    };
  }, [searchParams, token]);

  useEffect(() => {
    let isMounted = true;

    async function verifyEmail() {
      if (!verification.tokenHash) {
        setStatus("sent");
        return;
      }

      if (!supabase) {
        setStatus("expired");
        setMessage("Supabase is not configured, so this verification link cannot be checked.");
        return;
      }

      setStatus("checking");
      setMessage("");

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: verification.tokenHash,
        type: verification.type,
      });

      if (!isMounted) return;

      if (error) {
        setStatus("expired");
        setMessage(error.message);
        return;
      }

      setVerifiedEmail(data.user?.email || verification.newEmail);
      setStatus("success");
    }

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [verification]);

  return (
    <AuthChrome>
      <section className="auth-card">
        {status === "sent" || status === "checking" ? (
          <>
            <p className="auth-card-eyebrow">§ Email Verification</p>
            <h1>Verify Your New Email</h1>
            <p className="sub">
              {status === "checking"
                ? "Checking this verification link."
                : "A verification link was sent to your new address. Until it's verified, your previous email remains in effect."}
            </p>

            <div className="banner is-warn">
              <div className="banner-mark" />
              <div className="banner-body">
                <span className="ban-title">{status === "checking" ? "Checking link" : "Signed out"}</span>
                {status === "checking"
                  ? "Keep this tab open while Solstein confirms the token."
                  : "For your safety, Solstein signs you out during email changes. Click the verification link before signing back in."}
              </div>
            </div>

            <dl className="auth-facts">
              <dt>New email</dt>
              <dd>{verification.newEmail || "Pending verification"}</dd>
              <dt>Previous</dt>
              <dd>{verification.previousEmail || "Current account email"}</dd>
              <dt>Expires</dt>
              <dd>24 hours from request</dd>
            </dl>

            <div className="aux">
              <Link to="/sign-in">Back to sign in</Link>
            </div>
          </>
        ) : null}

        {status === "success" ? (
          <div className="token-state is-success">
            <div className="glyph">✓</div>
            <p className="auth-card-eyebrow">§ Email Verified</p>
            <h1>Email Verified</h1>
            <p className="sub">
              {verifiedEmail ? (
                <>
                  Your account now uses <strong>{verifiedEmail}</strong>. Sign in to continue.
                </>
              ) : (
                "Your email address has been verified. Sign in to continue."
              )}
            </p>
            <Link className="btn btn-primary" to="/sign-in">
              Sign In
            </Link>
          </div>
        ) : null}

        {status === "expired" ? (
          <div className="token-state is-expired">
            <div className="glyph">↻</div>
            <p className="auth-card-eyebrow">§ Link Expired</p>
            <h1>Link Expired</h1>
            <p className="sub">
              {message || "Verification links are valid for 24 hours. Sign in to request a new one from your profile."}
            </p>
            <Link className="btn btn-primary" to="/sign-in">
              Sign In
            </Link>
          </div>
        ) : null}
      </section>
    </AuthChrome>
  );
}
