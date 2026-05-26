import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth.js";

function LoadingScreen() {
  return (
    <div className="auth-shell">
      <main className="auth-shell-body">
        <section className="auth-card">
          <p className="auth-card-eyebrow">§ Session</p>
          <h1>Loading</h1>
          <p className="sub">Checking your Solstein session.</p>
        </section>
      </main>
    </div>
  );
}

export function RequireUser({ children }) {
  const { bootstrapError, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  if (bootstrapError) {
    return (
      <div className="auth-shell">
        <main className="auth-shell-body">
          <section className="auth-card">
            <p className="auth-card-eyebrow">§ Workspace</p>
            <h1>Setup Failed</h1>
            <p className="sub">{bootstrapError.message}</p>
          </section>
        </main>
      </div>
    );
  }

  return children;
}

export function RequireOperator({ children }) {
  const { isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/operator/sign-in" replace state={{ from: location }} />;
  }

  if (!user.app_metadata?.operator && !user.user_metadata?.operator) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function RedirectSignedIn({ children }) {
  const { isLoading, user } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/";

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return children;
}
