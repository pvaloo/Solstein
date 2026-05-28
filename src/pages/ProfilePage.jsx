import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth.js";
import {
  getOwnProfile,
  updateAccountPassword,
  updateOwnProfile,
} from "../lib/profile.js";

function initials(email, name) {
  const source = name || email || "?";
  return source
    .split(/[ .@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function passwordGrade(value) {
  if (!value) return { label: "-", score: 0 };
  if (value.length >= 16 && /[0-9]/.test(value) && /[A-Za-z]/.test(value) && /[^A-Za-z0-9]/.test(value)) {
    return { label: "Strong", score: 4 };
  }
  if (value.length >= 12 && /[0-9]/.test(value) && /[A-Za-z]/.test(value)) {
    return { label: "Good", score: 3 };
  }
  if (value.length >= 12) return { label: "Ok", score: 2 };
  if (value.length >= 8) return { label: "Weak", score: 1 };
  return { label: "Too short", score: 0 };
}

function Banner({ kind = "info", title, children }) {
  return (
    <div className={`banner is-${kind}`}>
      <div className="banner-mark" />
      <div className="banner-body">
        <span className="ban-title">{title}</span>
        {children}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [status, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setStatus(null);

      const result = await getOwnProfile(user.id);
      if (!isMounted) return;

      if (result.error) {
        setStatus({ kind: "error", title: "Profile unavailable", text: result.error.message });
      } else {
        const fallbackName = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
        setProfile(result.profile);
        setName(result.profile?.full_name || fallbackName);
      }

      setIsLoading(false);
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user.email, user.id, user.user_metadata?.full_name]);

  const email = profile?.email || user.email || "";
  const displayName = profile?.full_name || name || email.split("@")[0] || "Solstein user";
  const avatarText = initials(email, displayName);
  const grade = useMemo(() => passwordGrade(newPassword), [newPassword]);

  async function saveName(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setStatus({ kind: "error", title: "Name required", text: "Enter a display name before saving." });
      return;
    }

    setIsSavingName(true);
    setStatus(null);

    const profileResult = await updateOwnProfile(user.id, { full_name: trimmedName });

    if (profileResult.error) {
      setStatus({
        kind: "error",
        title: "Name not saved",
        text: profileResult.error.message,
      });
    } else {
      setProfile(profileResult.profile);
      setStatus({ kind: "info", title: "Name updated", text: "Your profile name has been saved." });
    }

    setIsSavingName(false);
  }

  async function savePassword(event) {
    event.preventDefault();

    if (newPassword.length < 12) {
      setStatus({ kind: "error", title: "Password too short", text: "Use at least 12 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ kind: "error", title: "Password mismatch", text: "The password confirmation does not match." });
      return;
    }

    setIsSavingPassword(true);
    setStatus(null);

    const result = await updateAccountPassword(newPassword);

    if (result.error) {
      setStatus({ kind: "error", title: "Password not updated", text: result.error.message });
    } else {
      setNewPassword("");
      setConfirmPassword("");
      setStatus({
        kind: "info",
        title: "Password updated",
        text: "Your Solstein password has been changed.",
      });
    }

    setIsSavingPassword(false);
  }

  return (
    <main className="page profile-page">
      <div className="kicker">§ Account</div>
      <h1 className="page-title">Profile &amp; Security</h1>
      <p className="page-sub">Manage your identity, password, signed-in devices, and account.</p>

      {status ? (
        <Banner kind={status.kind} title={status.title}>
          {status.text}
        </Banner>
      ) : null}

      <div className="prof-grid">
        <nav className="prof-nav" aria-label="Profile sections">
          <div className="lbl">§ Sections</div>
          <ul>
            <li><a href="#identity" className="is-here">Identity</a></li>
            <li><a href="#password">Password</a></li>
          </ul>
        </nav>

        <div>
          <section className="psec" id="identity">
            <div className="psec-head">
              <h2>Identity</h2>
              <span className="meta">{isLoading ? "Loading" : "Current account"}</span>
            </div>
            <form className="psec-body" onSubmit={saveName}>
              <div className="identity-row">
                <div className="identity-avatar">{avatarText}</div>
                <div className="identity-info">
                  <dl>
                    <dt>Name</dt>
                    <dd>
                      <input
                        className="profile-inline-input"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={isLoading || isSavingName}
                      />
                    </dd>
                    <dt>Email</dt>
                    <dd>{email}</dd>
                    <dt>Account ID</dt>
                    <dd className="account-id">{user.id}</dd>
                  </dl>
                </div>
                <div className="identity-actions">
                  <button className="btn btn-sm" type="submit" disabled={isLoading || isSavingName}>
                    {isSavingName ? "Saving..." : "Save Name"}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="psec" id="password">
            <div className="psec-head">
              <h2>Password</h2>
            </div>
            <form className="psec-body" onSubmit={savePassword}>
              <div className="field">
                <label className="field-label" htmlFor="new-pw">New Password</label>
                <div className="pw-wrap">
                  <input
                    className="input"
                    id="new-pw"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                  <button className="pw-toggle" type="button" onClick={() => setShowPassword((shown) => !shown)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="pw-strength">
                  <div className="bars">
                    {[1, 2, 3, 4].map((segment) => (
                      <div key={segment} className={`seg${segment <= grade.score ? " on" : ""}`} />
                    ))}
                  </div>
                  <div className="label">
                    <span className="req-list">Min 12 characters</span>
                    <span className="grade">{grade.label}</span>
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="confirm-pw">Confirm New Password</label>
                <div className="pw-wrap">
                  <input
                    className="input"
                    id="confirm-pw"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <button className="pw-toggle" type="button" onClick={() => setShowPassword((shown) => !shown)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="field-actions">
                <button className="btn btn-primary" type="submit" disabled={isSavingPassword}>
                  {isSavingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
