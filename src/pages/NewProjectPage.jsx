import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import { createWorkspaceProject } from "../lib/projects.js";

function buildDescription({ domain, client, description }) {
  const parts = [];

  if (client.trim()) parts.push(`Client: ${client.trim()}`);
  if (domain.trim()) parts.push(`Domain: ${domain.trim()}`);
  if (description.trim()) parts.push(description.trim());

  return parts.join("\n\n") || "Created from the new project flow.";
}

export function NewProjectPage() {
  const navigate = useNavigate();
  const { workspaceId } = useAuth();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanName = name.trim();
    if (!cleanName || !workspaceId) return;

    setIsSubmitting(true);
    setError(null);

    const { project, error: createError } = await createWorkspaceProject(
      workspaceId,
      cleanName,
      buildDescription({ domain, client, description }),
    );

    setIsSubmitting(false);

    if (createError) {
      setError(createError);
      return;
    }

    navigate(`/project/${project.id}`);
  }

  return (
    <main className="page new-project-page">
      <Link className="back-link" to="/">
        ← All projects
      </Link>
      <div className="kicker">§ New project</div>
      <h1 className="page-title">Take a reading</h1>

      {error ? (
        <div className="banner is-error workspace-banner">
          <div className="banner-mark" />
          <div className="banner-body">
            <span className="ban-title">Project creation failed</span>
            {error.message}
          </div>
        </div>
      ) : null}

      <div className="np-layout">
        <form className="np-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="np-name">
              Project name <span className="req">*</span>
            </label>
            <input
              className="input"
              id="np-name"
              placeholder="e.g. Car Insurance Comparison"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="np-domain">
              Domain
            </label>
            <input
              className="input"
              id="np-domain"
              placeholder="e.g. Insurance, Banking, Telecoms"
              autoComplete="off"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="np-client">
              Client
            </label>
            <input
              className="input"
              id="np-client"
              placeholder="e.g. Acme Insurance Group"
              autoComplete="off"
              value={client}
              onChange={(event) => setClient(event.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="np-desc">
              Description
            </label>
            <textarea
              className="textarea"
              id="np-desc"
              placeholder="One or two sentences on what this project covers — the scope, the question, anything that helps the team get their bearing later."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="np-actions">
            <Link className="btn btn-ghost cancel" to="/">
              Cancel
            </Link>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating" : "Create project"}
            </button>
          </div>
        </form>

        <aside className="np-side">
          <h3>What happens next</h3>
          <div className="row">
            <div className="ic">1</div>
            <div className="body">
              <strong>Empty project</strong>
              You land on the project page — quiet until you add a graph.
            </div>
          </div>
          <div className="row">
            <div className="ic">2</div>
            <div className="body">
              <strong>Import a graph</strong>
              Upload a JSON of nodes and edges. The wizard validates it and helps you set up views and overlays.
            </div>
          </div>
          <div className="row">
            <div className="ic">3</div>
            <div className="body">
              <strong>Open the canvas</strong>
              Inspector, lenses, replay — every tool needed to see how the system actually works.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
