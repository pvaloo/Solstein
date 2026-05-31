import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth.js";

function navClass({ isActive }) {
  return isActive ? "is-active" : undefined;
}

function userInitials(user) {
  const source = user?.user_metadata?.full_name || user?.email || "JM";
  return source
    .split(/[ .@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "JM";
}

function userName(user) {
  return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "James Mitchell";
}

function AmbientMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 52 52" aria-hidden="true">
      <polygon
        points="26,4 40,12 44,26 40,40 26,48 12,40 8,26 12,12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.9"
      />
      <polygon
        className="refraction"
        points="26,10 36,16 39,26 36,36 26,42 16,36 13,26 16,16"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.4"
      />
      <circle cx="26" cy="26" r="2.5" fill="currentColor" opacity="0.9" />
      <circle
        className="glow"
        cx="26"
        cy="26"
        r="5"
        fill="currentColor"
        opacity="0.25"
        style={{ filter: "blur(3px)" }}
      />
      <line x1="26" y1="10" x2="26" y2="42" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <line x1="10" y1="26" x2="42" y2="26" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
    </svg>
  );
}

export function WorkspaceChrome({ children }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const initials = userInitials(user);

  return (
    <>
      <div className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <AmbientMark />
          </span>
          SOLSTEIN
        </Link>
        <span className="topbar-divider" />
        <nav className="crumb workspace-react-crumb" aria-label="Primary">
          <NavLink to="/" end className={navClass}>
            Workspace
          </NavLink>
          <span className="sep">/</span>
          <NavLink to="/new-project" className={navClass}>
            New project
          </NavLink>
        </nav>
        <span className="topbar-spacer" />
        <div className={`user-menu${isMenuOpen ? " is-open" : ""}`} id="reactUserMenu">
          <button
            className="user-chip"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <div className="avatar">{initials}</div>
            <span>{userName(user)}</span>
            <svg
              className="caret"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 4.5l3 3 3-3" />
            </svg>
          </button>
          <div className="user-menu-pop" role="menu">
            <div className="um-identity">
              <div className="avatar">{initials}</div>
              <div className="who">
                <div className="name">{userName(user)}</div>
                <div className="email">{user?.email ?? "james.mitchell@consultancy.com"}</div>
              </div>
            </div>
            <div className="um-section">§ Account</div>
            <Link className="um-item" role="menuitem" to="/profile" onClick={() => setIsMenuOpen(false)}>
              Profile &amp; Security
            </Link>
            <div className="um-divider" />
            <button
              className="um-item is-danger workspace-signout"
              role="menuitem"
              type="button"
              onClick={async () => {
                setIsMenuOpen(false);
                await signOut();
                navigate("/signed-out", { replace: true });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
