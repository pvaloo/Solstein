import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import {
  createWorkspaceProject,
  listWorkspaceProjects,
} from "../lib/projects.js";

function relativeDate(value) {
  if (!value) return "just now";

  const deltaMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(deltaMs / 60000));

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;

  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

function graphCountLabel(count) {
  const graphCount = Number(count ?? 0);
  return `${graphCount} ${graphCount === 1 ? "graph" : "graphs"}`;
}

function ProjectCard({ project, archived = false, onRestore }) {
  return (
    <Link
      className={`proj-card${archived ? " is-archived" : ""}`}
      to={`/project/${project.id}`}
    >
      {archived ? <div className="arc-tag">Archived</div> : null}
      <div className="pc-name">{project.name}</div>
      <div className="pc-client">{project.description || "Solstein Workspace"}</div>
      <div className="pc-meta">
        <span className="pc-domain">Workspace</span>
        <span className="dot" />
        <span className="pc-graphs">{graphCountLabel(project.graph_count)}</span>
        <span className="dot" />
        <span>{archived ? `Archived ${relativeDate(project.updated_at)}` : relativeDate(project.updated_at)}</span>
      </div>
      {archived ? (
        <button
          className="pc-restore"
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRestore(project.id);
          }}
        >
          Unarchive
        </button>
      ) : null}
    </Link>
  );
}

export function WorkspacePage() {
  const { user, workspaceId } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("active");
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    const { projects: nextProjects, error: nextError } =
      await listWorkspaceProjects(workspaceId);
    setProjects(nextProjects);
    setError(nextError);
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    refreshProjects();
  }, [refreshProjects, workspaceId]);

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status === "active"),
    [projects],
  );
  const archivedProjects = useMemo(
    () => projects.filter((project) => project.status === "archived"),
    [projects],
  );

  async function handleCreateProject(event) {
    event.preventDefault();
    const name = newProjectName.trim();

    if (!name || !workspaceId) return;

    setIsCreating(true);
    const { error: createError } = await createWorkspaceProject(workspaceId, name);
    setIsCreating(false);

    if (createError) {
      setError(createError);
      return;
    }

    setNewProjectName("");
    refreshProjects();
  }

  const pageState = isLoading || activeProjects.length > 0 ? "full" : "empty";

  return (
    <div
      className="page workspace-page"
      id="workspacePage"
      data-state={pageState}
      data-tab={tab}
    >
      <div className="kicker">§ Workspace</div>
      <h1 className="page-title">Projects</h1>

      <div className="workspace-gate">
        You’re signed in as <strong>{user?.email}</strong>. Projects shown here are scoped to
        your workspace.
      </div>

      {error ? (
        <div className="banner is-error workspace-banner">
          <div className="banner-mark" />
          <div className="banner-body">
            <span className="ban-title">Workspace error</span>
            {error.message}
          </div>
        </div>
      ) : null}

      <div className="lifecycle-tabs" id="lifecycleTabs">
        <div className="lt-strip">
          <button
            className={`lt-tab${tab === "active" ? " is-on" : ""}`}
            data-tab="active"
            type="button"
            onClick={() => setTab("active")}
          >
            Active <span className="ct" id="ct-active">{activeProjects.length}</span>
          </button>
          <button
            className={`lt-tab${tab === "archived" ? " is-on" : ""}`}
            data-tab="archived"
            type="button"
            onClick={() => setTab("archived")}
          >
            Archived <span className="ct" id="ct-archived">{archivedProjects.length}</span>
          </button>
        </div>
        <div className="lt-meta">owner view</div>
      </div>

      {isLoading ? (
        <div className="archived-empty">Loading workspace</div>
      ) : null}

      {!isLoading ? (
        <>
          <div className="v1-grid">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}

            <form className="add-card project-create-card" onSubmit={handleCreateProject}>
              <div className="plus">+</div>
              <label className="label" htmlFor="new-project-name">
                New project
              </label>
              <input
                id="new-project-name"
                className="project-create-input"
                type="text"
                value={newProjectName}
                placeholder="Project name"
                onChange={(event) => setNewProjectName(event.target.value)}
              />
              <button className="project-create-submit" type="submit" disabled={isCreating}>
                {isCreating ? "Creating" : "Create"}
              </button>
            </form>
          </div>

          <div className="archived-grid" id="archivedGrid">
            {archivedProjects.length > 0 ? (
              archivedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  archived
                  onRestore={() => setError(new Error("Restore is not wired yet."))}
                />
              ))
            ) : (
              <div className="archived-empty">No archived projects</div>
            )}
          </div>

          <div className="empty-hero">
            <div className="empty-block">
              <svg className="e-glyph" viewBox="0 0 52 52" aria-hidden="true">
                <polygon
                  points="26,4 40,12 44,26 40,40 26,48 12,40 8,26 12,12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <polygon
                  points="26,12 36,17 39,26 36,35 26,40 16,35 13,26 16,17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  opacity="0.45"
                />
                <circle cx="26" cy="26" r="2" fill="currentColor" />
              </svg>
              <div className="e-rule" />
              <div className="e-eyebrow">§ Workspace</div>
              <h2 className="e-lede">Start your first project</h2>
              <p className="e-help">
                A project holds the graphs, imports, and shared links for one engagement.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
