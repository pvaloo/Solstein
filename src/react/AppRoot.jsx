import { Navigate, Route, Routes, useParams } from "react-router-dom";
import {
  RedirectSignedIn,
  RequireOperator,
  RequireUser,
} from "../auth/RouteGuards.jsx";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage.jsx";
import { GraphPage } from "../pages/GraphPage.jsx";
import { ImportGraphPage } from "../pages/ImportGraphPage.jsx";
import { NewProjectPage } from "../pages/NewProjectPage.jsx";
import { ProjectPage } from "../pages/ProjectPage.jsx";
import { ResetPasswordPage } from "../pages/ResetPasswordPage.jsx";
import { SignInPage } from "../pages/SignInPage.jsx";
import { WorkspacePage } from "../pages/WorkspacePage.jsx";
import { WorkspaceChrome } from "../components/WorkspaceChrome.jsx";
import { ROUTES } from "../routes.js";
import { StaticRoutePage } from "../pages/StaticRoutePage.jsx";

function routeElement(route) {
  if (route.id === "sign-in") {
    return (
      <RedirectSignedIn>
        <SignInPage />
      </RedirectSignedIn>
    );
  }

  if (route.id === "operator-sign-in") {
    return (
      <RedirectSignedIn>
        <SignInPage operator />
      </RedirectSignedIn>
    );
  }

  if (route.id === "forgot") {
    return (
      <RedirectSignedIn>
        <ForgotPasswordPage />
      </RedirectSignedIn>
    );
  }

  if (route.id === "reset") {
    return <ResetPasswordPage />;
  }

  if (route.id === "workspace") {
    return (
      <RequireUser>
        <WorkspaceChrome>
          <WorkspacePage />
        </WorkspaceChrome>
      </RequireUser>
    );
  }

  if (route.id === "new-project") {
    return (
      <RequireUser>
        <WorkspaceChrome>
          <NewProjectPage />
        </WorkspaceChrome>
      </RequireUser>
    );
  }

  if (route.id === "project") {
    return (
      <RequireUser>
        <WorkspaceChrome>
          <ProjectPage />
        </WorkspaceChrome>
      </RequireUser>
    );
  }

  if (route.id === "import") {
    return (
      <RequireUser>
        <WorkspaceChrome>
          <ImportGraphPage />
        </WorkspaceChrome>
      </RequireUser>
    );
  }

  if (route.id === "canvas") {
    return (
      <RequireUser>
        <GraphPage />
      </RequireUser>
    );
  }

  if (route.auth === "operator") {
    return <RequireOperator>{<StaticRoutePage route={route} />}</RequireOperator>;
  }

  if (route.auth === "user" || route.auth === "project") {
    return <RequireUser>{<StaticRoutePage route={route} />}</RequireUser>;
  }

  return <StaticRoutePage route={route} />;
}

export default function AppRoot() {
  return (
    <Routes>
      {ROUTES.map((route) => (
        <Route key={route.id} path={route.path} element={routeElement(route)} />
      ))}
      <Route path="/p/:projectId" element={<LegacyProjectRedirect />} />
      <Route path="/p/:projectId/import" element={<LegacyProjectRedirect suffix="import" />} />
      <Route path="/p/:projectId/g/:graphId" element={<LegacyGraphRedirect />} />
      <Route path="/operator" element={<Navigate to="/operator/" replace />} />
      <Route
        path="*"
        element={<StaticRoutePage route={ROUTES.find((route) => route.id === "not-found")} />}
      />
    </Routes>
  );
}

function LegacyProjectRedirect({ suffix = "" }) {
  const { projectId } = useParams();
  const target = suffix ? `/project/${projectId}/${suffix}` : `/project/${projectId}`;
  return <Navigate to={target} replace />;
}

function LegacyGraphRedirect() {
  const { projectId, graphId } = useParams();
  return <Navigate to={`/project/${projectId}/graph/${graphId}`} replace />;
}
