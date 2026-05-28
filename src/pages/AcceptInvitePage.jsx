import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import { AuthChrome } from "../components/AuthChrome.jsx";
import {
  acceptProjectInvitation,
  getProjectInvitation,
} from "../lib/invitations.js";

function statusCopy(invitation) {
  if (!invitation) return "This invitation could not be found.";
  if (invitation.status === "expired") return "This invitation has expired.";
  if (invitation.status === "revoked") return "This invitation was revoked.";
  if (invitation.status === "accepted") return "This invitation has already been accepted.";
  return "";
}

export function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isLoading: isAuthLoading, user } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadInvitation() {
      setIsLoading(true);
      setError(null);
      const result = await getProjectInvitation(token);
      if (!isMounted) return;
      setInvitation(result.invitation);
      setError(result.error);
      setIsLoading(false);
    }

    loadInvitation();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (!isAuthLoading && !user) {
    return <Navigate to="/sign-in" replace state={{ from: { pathname: `/invite/${token}` } }} />;
  }

  async function acceptInvite() {
    setIsAccepting(true);
    setError(null);

    const result = await acceptProjectInvitation(token);
    if (result.error) {
      setError(result.error);
      setIsAccepting(false);
      return;
    }

    navigate(`/project/${result.accepted.project_id}`, { replace: true });
  }

  const unavailableCopy = statusCopy(invitation);
  const emailMismatch =
    user &&
    invitation?.invitee_email &&
    user.email?.toLowerCase() !== invitation.invitee_email.toLowerCase();

  return (
    <AuthChrome>
      <section className="auth-card">
        <p className="auth-card-eyebrow">§ Workspace Invitation</p>
        <h1>You're Invited</h1>

        {isAuthLoading || isLoading ? (
          <p className="sub">Checking this Solstein invitation.</p>
        ) : null}

        {!isLoading && invitation ? (
          <p className="sub">
            {invitation.inviter_email ?? "A teammate"} invited you to join{" "}
            <strong>{invitation.project_name}</strong> as {invitation.project_role}.
          </p>
        ) : null}

        {error ? (
          <div className="banner is-error">
            <div className="banner-mark" />
            <div className="banner-body">
              <span className="ban-title">Invitation unavailable</span>
              {error.message}
            </div>
          </div>
        ) : null}

        {!error && unavailableCopy ? (
          <div className="banner is-error">
            <div className="banner-mark" />
            <div className="banner-body">
              <span className="ban-title">Invitation unavailable</span>
              {unavailableCopy}
            </div>
          </div>
        ) : null}

        {!error && emailMismatch ? (
          <div className="banner is-error">
            <div className="banner-mark" />
            <div className="banner-body">
              <span className="ban-title">Wrong account</span>
              Sign in with {invitation.invitee_email} to accept this invitation.
            </div>
          </div>
        ) : null}

        {invitation?.personal_note ? (
          <div className="banner is-info">
            <div className="banner-mark" />
            <div className="banner-body">
              <span className="ban-title">Message</span>
              {invitation.personal_note}
            </div>
          </div>
        ) : null}

        <div className="auth-actions">
          <Link className="btn" to="/">
            Back to workspace
          </Link>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!invitation || invitation.status !== "pending" || emailMismatch || isAccepting}
            onClick={acceptInvite}
          >
            {isAccepting ? "Accepting..." : "Accept Invitation"}
          </button>
        </div>
      </section>
    </AuthChrome>
  );
}
