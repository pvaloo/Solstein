import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getProject,
  listProjectGraphs,
  listProjectMembers,
} from "../lib/projects.js";

function countGraphItems(graph) {
  const nodes = Array.isArray(graph.payload?.nodes) ? graph.payload.nodes.length : 0;
  const edges = Array.isArray(graph.payload?.edges) ? graph.payload.edges.length : 0;
  return { nodes, edges };
}

function initials(email, name) {
  const source = name || email || "?";
  const parts = source.split(/[ .@_-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}

function GraphPreview() {
  return (
    <svg viewBox="0 0 320 144" role="img" aria-label="Graph preview">
      <path className="edge" d="M58 72 C 118 26, 166 34, 228 74" />
      <path className="edge" d="M98 104 C 142 122, 188 112, 250 96" />
      <circle className="node cat-op" cx="58" cy="72" r="16" />
      <circle className="node cat-info" cx="130" cy="42" r="14" />
      <circle className="node cat-tech" cx="220" cy="74" r="18" />
      <circle className="node cat-gov" cx="252" cy="96" r="13" />
      <circle className="node cat-op" cx="98" cy="104" r="12" />
    </svg>
  );
}

function GraphCard({ graph }) {
  const { nodes, edges } = countGraphItems(graph);

  return (
    <Link className="graph-card" to={`/project/${graph.project_id}/graph/${graph.id}`}>
      <div className="graph-thumb">
        <GraphPreview />
        <div className="ver">v{graph.version}</div>
      </div>
      <div className="graph-meta">
        <div className="gn">{graph.name}</div>
        <div className="gr">
          <span className="count">{nodes} nodes</span>
          <span className="dot" />
          <span>{edges} edges</span>
        </div>
      </div>
    </Link>
  );
}

function EmptyGraphs({ projectId }) {
  return (
    <div className="empty-hero project-empty-hero">
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
        <div className="e-eyebrow">§ Graphs</div>
        <h2 className="e-lede">Import your first graph</h2>
        <p className="e-help">
          Bring one in from a CSV, Excel, or JSON source via the Import Wizard.
        </p>
        <div className="e-actions">
          <Link className="e-primary" to={`/project/${projectId}/import`}>
            Import graph
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [graphs, setGraphs] = useState([]);
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState("graphs");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      setIsLoading(true);
      setError(null);

      const [projectResult, graphsResult, membersResult] = await Promise.all([
        getProject(projectId),
        listProjectGraphs(projectId),
        listProjectMembers(projectId),
      ]);

      if (!isMounted) return;

      if (projectResult.error) {
        setError(projectResult.error);
      } else if (graphsResult.error) {
        setError(graphsResult.error);
      } else if (membersResult.error) {
        setError(membersResult.error);
      }

      setProject(projectResult.project);
      setGraphs(graphsResult.graphs);
      setMembers(membersResult.members);
      setIsLoading(false);
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const activeMembers = useMemo(
    () =>
      members.map((member) => ({
        ...member,
        email: member.email ?? "Unknown user",
        name: member.full_name ?? "",
      })),
    [members],
  );

  if (isLoading) {
    return (
      <main className="page project-page">
        <Link className="back-link" to="/">
          ← All projects
        </Link>
        <div className="archived-empty">Loading project</div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="page project-page">
        <Link className="back-link" to="/">
          ← All projects
        </Link>
        <div className="banner is-error workspace-banner">
          <div className="banner-mark" />
          <div className="banner-body">
            <span className="ban-title">Project unavailable</span>
            {error?.message ?? "This project could not be loaded."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page project-page">
      <Link className="back-link" to="/">
        ← All projects
      </Link>

      <header className="proj-header">
        <div className="title-row">
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {project.name}
          </h1>
          <Link className="btn btn-sm" to={`/project/${project.id}/import`}>
            Import graph
          </Link>
        </div>
        <div className="meta-row">
          <span className="domain">Workspace project</span>
          <span className="dot" />
          <span>{project.status}</span>
          <span className="dot" />
          <span>{graphs.length} graphs</span>
          <span className="dot" />
          <span>{activeMembers.length} members</span>
        </div>
        {project.description ? <p className="desc">{project.description}</p> : null}
      </header>

      <div className="tabs" role="tablist" aria-label="Project sections">
        <button
          className={`tab${tab === "graphs" ? " is-on" : ""}`}
          type="button"
          role="tab"
          onClick={() => setTab("graphs")}
        >
          Graphs <span className="count">{graphs.length}</span>
        </button>
        <button
          className={`tab${tab === "members" ? " is-on" : ""}`}
          type="button"
          role="tab"
          onClick={() => setTab("members")}
        >
          Members <span className="count">{activeMembers.length}</span>
        </button>
      </div>

      <section className={`panel${tab === "graphs" ? " is-on" : ""}`}>
        {graphs.length > 0 ? (
          <div className="graphs-grid">
            {graphs.map((graph) => (
              <GraphCard key={graph.id} graph={graph} />
            ))}
            <Link className="add-card graph-card-add" to={`/project/${project.id}/import`}>
              <div className="plus">+</div>
              <div className="label">Import graph</div>
            </Link>
          </div>
        ) : (
          <EmptyGraphs projectId={project.id} />
        )}
      </section>

      <section className={`panel${tab === "members" ? " is-on" : ""}`}>
        <div className="members-card">
          <div className="head">
            <div>Member</div>
            <div>Email</div>
            <div>Role</div>
            <div />
          </div>
          {activeMembers.map((member) => (
            <div className="row" key={member.user_id}>
              <div className="who">
                <div className="av">{initials(member.email, member.name)}</div>
                <div>
                  <div className="name">{member.name || member.email}</div>
                  <div className="email">{member.email}</div>
                </div>
              </div>
              <div className="email">{member.email}</div>
              <div>
                <span className={`role ${member.role}`}>{member.role}</span>
              </div>
              <div className="actions" />
            </div>
          ))}
          {activeMembers.length === 0 ? (
            <div className="members-add">
              <span className="ic">+</span>
              No project members yet
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
