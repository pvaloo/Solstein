import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import { AuthChrome, CrystalMark } from "../components/AuthChrome.jsx";
import { WorkspaceChrome } from "../components/WorkspaceChrome.jsx";

const referenceBase = "/original_files/html";

function OperatorChrome({ children }) {
  return (
    <div className="operator-shell react-route-shell">
      <header className="topbar">
        <Link className="brand" to="/operator/">
          <span className="brand-mark">
            <CrystalMark />
          </span>
          <span>SOLSTEIN OPERATOR</span>
        </Link>
        <span className="topbar-divider" />
        <nav className="crumb" aria-label="Operator">
          <Link to="/operator/">Dashboard</Link>
          <Link to="/operator/users">Users</Link>
          <Link to="/operator/invitations">Invitations</Link>
        </nav>
      </header>
      <main className="page react-route-page">{children}</main>
    </div>
  );
}

function RouteCard({ route }) {
  const { workspaceId } = useAuth();

  return (
    <section className="react-route-card">
      <p className="eyebrow">React route scaffold</p>
      <h1>{route.title}</h1>
      <p>{route.summary}</p>
      <div className="react-route-meta">
        <span>Prototype</span>
        <a href={`${referenceBase}/${route.prototype}`}>{route.prototype}</a>
      </div>
      <div className="react-route-meta">
        <span>Surface</span>
        <strong>{route.surface}</strong>
      </div>
      {route.auth === "user" || route.auth === "project" ? (
        <div className="react-route-meta">
          <span>Workspace</span>
          <strong>{workspaceId ?? "pending"}</strong>
        </div>
      ) : null}
    </section>
  );
}

export function StaticRoutePage({ route }) {
  if (route.surface === "auth") {
    return (
      <AuthChrome>
        <RouteCard route={route} />
      </AuthChrome>
    );
  }

  if (route.surface === "operator") {
    return (
      <OperatorChrome>
        <RouteCard route={route} />
      </OperatorChrome>
    );
  }

  return (
    <WorkspaceChrome>
      <main className="page react-route-page">
        <RouteCard route={route} />
      </main>
    </WorkspaceChrome>
  );
}
