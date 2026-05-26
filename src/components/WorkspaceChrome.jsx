import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import { CrystalMark } from "./AuthChrome.jsx";

function navClass({ isActive }) {
  return isActive ? "is-active" : undefined;
}

export function WorkspaceChrome({ children }) {
  const { signOut, user } = useAuth();

  return (
    <div className="react-route-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <CrystalMark />
          </span>
          <span>SOLSTEIN</span>
        </Link>
        <span className="topbar-divider" />
        <nav className="crumb" aria-label="Primary">
          <NavLink to="/" end className={navClass}>
            Projects
          </NavLink>
          <NavLink to="/new-project" className={navClass}>
            New project
          </NavLink>
        </nav>
        <span className="topbar-spacer" />
        {user ? <span className="react-user-email">{user.email}</span> : null}
        <Link className="btn btn-secondary topbar-action" to="/new-project">
          New project
        </Link>
        <button className="btn btn-secondary" type="button" onClick={signOut}>
          Sign out
        </button>
      </header>
      {children}
    </div>
  );
}
