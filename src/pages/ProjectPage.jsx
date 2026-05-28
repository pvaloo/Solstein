import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import {
  createProjectInvitations,
  listProjectInvitations,
  revokeProjectInvitation,
} from "../lib/invitations.js";
import {
  getProject,
  listProjectGraphs,
  listProjectMembers,
  setProjectStatus,
} from "../lib/projects.js";

const ROLE_LABELS = {
  owner: "Owner",
  editor: "Editor",
  viewer: "Viewer",
};

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

function formatExpiry(value) {
  if (!value) return "No expiry";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function parseEmails(value) {
  return Array.from(
    new Set(
      value
        .split(/[\s,;]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
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

function EmptyMembers({ onInvite, canInvite }) {
  return (
    <div className="empty-hero" id="membersEmpty">
      <div className="empty-block">
        <svg className="e-glyph" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="20" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 38 Q11 28 20 28 Q29 28 29 38" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="36" cy="22" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <path d="M28 38 Q28 31 36 31 Q44 31 44 38" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        </svg>
        <div className="e-rule" />
        <div className="e-eyebrow">§ Just You</div>
        <h2 className="e-lede">Invite your team</h2>
        <p className="e-help">
          Invite teammates as Editors, or external clients as Viewers. They'll see the project once they accept.
        </p>
        {canInvite ? (
          <div className="e-actions">
            <button className="e-primary" type="button" onClick={onInvite}>
              Invite Members
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InviteModal({
  existingEmails,
  inviteLinks,
  isOpen,
  isSending,
  message,
  onClose,
  onSubmit,
  projectName,
}) {
  const [emailText, setEmailText] = useState("");
  const [role, setRole] = useState("editor");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEmailText("");
      setRole("editor");
      setNote("");
    }
  }, [isOpen]);

  const emails = useMemo(() => parseEmails(emailText), [emailText]);
  const duplicateCount = emails.filter((email) => existingEmails.has(email)).length;
  const sendableEmails = emails.filter((email) => !existingEmails.has(email));
  const invalidCount = sendableEmails.filter((email) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)).length;
  const canSend = sendableEmails.length > 0 && invalidCount === 0 && !isSending;

  if (!isOpen) return null;

  function submitInvite(event) {
    event.preventDefault();
    if (!canSend) return;
    onSubmit(sendableEmails, role, note);
  }

  return (
    <div className="sol-modal-backdrop is-open" role="dialog" aria-modal="true" aria-labelledby="invite-title">
      <form className="sol-modal" onSubmit={submitInvite}>
        <div className="sol-modal-header">
          <div>
            <p className="sol-modal-eyebrow">§ Add member</p>
            <h2 className="sol-modal-title" id="invite-title">
              Invite to {projectName}
            </h2>
            <p className="sol-modal-sub">
              Invites create a one-click join link. They expire in 7 days.
            </p>
          </div>
          <button className="sol-modal-close" type="button" aria-label="Close invite" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        <section className="sol-modal-section">
          <div className="sol-modal-section-label">§ 01 / Who</div>
          <h3>Email addresses</h3>
          <p className="help">Paste any number of emails — commas, spaces, or new lines are fine.</p>
          <div className="sol-field">
            <textarea
              className="sol-textarea invite-email-box"
              placeholder="name@company.com, another@company.com"
              value={emailText}
              onChange={(event) => setEmailText(event.target.value)}
            />
          </div>
          <p className="help invite-stats">
            {sendableEmails.length === 0
              ? "No new addresses yet."
              : `${sendableEmails.length} invite${sendableEmails.length === 1 ? "" : "s"} ready.`}
            {duplicateCount > 0 ? ` ${duplicateCount} already on this project.` : ""}
            {invalidCount > 0 ? ` ${invalidCount} invalid.` : ""}
          </p>
        </section>

        <section className="sol-modal-section">
          <div className="sol-modal-section-label">§ 02 / Role</div>
          <h3>Role for everyone above</h3>
          <p className="help">Applies to every address. You can change individual roles after they join.</p>

          <div className="sol-segmented" role="radiogroup" aria-label="Project role">
            {["viewer", "editor", "owner"].map((nextRole) => (
              <label key={nextRole} className={role === nextRole ? "is-on" : ""}>
                <input
                  type="radio"
                  name="role"
                  value={nextRole}
                  checked={role === nextRole}
                  onChange={() => setRole(nextRole)}
                />
                {ROLE_LABELS[nextRole]}
              </label>
            ))}
          </div>

          {role === "owner" ? (
            <div className="sol-inline-note is-info">
              <span className="ic">i</span>
              <div>
                Owner grants lifecycle and access decisions. Solstein projects can have more than one owner.
              </div>
            </div>
          ) : null}
        </section>

        <section className="sol-modal-section">
          <div className="sol-modal-section-label">§ 03 / Note <span>(optional)</span></div>
          <h3>Add a line to the email</h3>
          <p className="help">Email delivery is not wired yet; this note is stored with the invite for the first local slice.</p>
          <div className="sol-field">
            <textarea
              className="sol-textarea"
              placeholder="Optional. e.g. We're mapping the comparison journey end-to-end."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </section>

        {message || inviteLinks.length > 0 ? (
          <section className="sol-modal-section">
            <div className={`sol-inline-note ${message?.kind === "error" ? "is-warn" : "is-info"}`}>
              <span className="ic">{message?.kind === "error" ? "!" : "i"}</span>
              <div>
                {message ? <strong>{message.text}</strong> : <strong>Manual invite links</strong>}
                {inviteLinks.length > 0 ? (
                  <div className="invite-links">
                    {inviteLinks.map((invite) => (
                      <a key={invite.invitation_id} href={invite.invite_url}>
                        {invite.email}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <div className="sol-modal-footer">
          <span className="meta">
            {sendableEmails.length === 0
              ? "No invites to send."
              : `${sendableEmails.length} invite${sendableEmails.length === 1 ? "" : "s"} to send.`}
          </span>
          <span className="spacer" />
          <button className="btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" disabled={!canSend}>
            {isSending ? "Sending..." : `Send invite${sendableEmails.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [graphs, setGraphs] = useState([]);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [tab, setTab] = useState("graphs");
  const [memberFilter, setMemberFilter] = useState("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState(null);
  const [inviteLinks, setInviteLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingLifecycle, setIsUpdatingLifecycle] = useState(false);
  const [lifecycleMessage, setLifecycleMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [projectResult, graphsResult, membersResult, invitationsResult] = await Promise.all([
      getProject(projectId),
      listProjectGraphs(projectId),
      listProjectMembers(projectId),
      listProjectInvitations(projectId),
    ]);

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
    if (!invitationsResult.error) {
      setInvitations(invitationsResult.invitations);
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    let isMounted = true;

    async function loadWhenMounted() {
      await loadProject();
      if (!isMounted) return;
    }

    loadWhenMounted();

    return () => {
      isMounted = false;
    };
  }, [loadProject]);

  const activeMembers = useMemo(
    () =>
      members.map((member) => ({
        ...member,
        email: member.email ?? "Unknown user",
        name: member.full_name ?? "",
      })),
    [members],
  );

  const currentMember = activeMembers.find((member) => member.user_id === user?.id);
  const canManageProject = currentMember?.role === "owner";
  const canInvite = canManageProject && project?.status === "active";
  const isArchived = project?.status === "archived";
  const pendingInvitations = invitations.filter((invitation) => invitation.status === "pending");
  const existingEmails = useMemo(
    () =>
      new Set([
        ...activeMembers.map((member) => member.email.toLowerCase()),
        ...pendingInvitations.map((invitation) => invitation.invitee_email.toLowerCase()),
      ]),
    [activeMembers, pendingInvitations],
  );

  const counts = useMemo(
    () => ({
      all: activeMembers.length,
      owner: activeMembers.filter((member) => member.role === "owner").length,
      editor: activeMembers.filter((member) => member.role === "editor").length,
      viewer: activeMembers.filter((member) => member.role === "viewer").length,
    }),
    [activeMembers],
  );

  const visibleMembers = memberFilter === "all"
    ? activeMembers
    : activeMembers.filter((member) => member.role === memberFilter);

  async function sendInvitations(emails, role, note) {
    setIsSendingInvite(true);
    setInviteMessage(null);
    setInviteLinks([]);

    const result = await createProjectInvitations(projectId, emails, role, note);

    if (result.error) {
      setInviteMessage({ kind: "error", text: result.error.message });
    } else {
      setInviteMessage({
        kind: "success",
        text: `${result.invitations.length} invite${result.invitations.length === 1 ? "" : "s"} created.`,
      });
      setInviteLinks(result.invitations);
      const invitationsResult = await listProjectInvitations(projectId);
      if (!invitationsResult.error) {
        setInvitations(invitationsResult.invitations);
      }
    }

    setIsSendingInvite(false);
  }

  async function revokeInvitation(invitationId) {
    const result = await revokeProjectInvitation(invitationId);
    if (result.error) {
      setError(result.error);
      return;
    }
    const invitationsResult = await listProjectInvitations(projectId);
    if (!invitationsResult.error) {
      setInvitations(invitationsResult.invitations);
    }
  }

  async function changeLifecycleStatus(status) {
    if (!project || isUpdatingLifecycle) return;

    setIsUpdatingLifecycle(true);
    setError(null);
    setLifecycleMessage(null);

    const { project: updatedProject, error: statusError } = await setProjectStatus(project.id, status);

    if (statusError) {
      setError(statusError);
      setIsUpdatingLifecycle(false);
      return;
    }

    setProject(updatedProject);
    setLifecycleMessage(
      status === "archived"
        ? `Archived "${updatedProject.name}". The project is now read-only.`
        : `Restored "${updatedProject.name}".`,
    );
    setIsUpdatingLifecycle(false);
  }

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
    <main className={`page project-page${isArchived ? " is-archived" : ""}`}>
      <Link className="back-link" to="/">
        ← All projects
      </Link>

      {isArchived ? (
        <div className="project-archived-banner" role="status">
          <div className="ab-eyebrow">§ Archived</div>
          <div className="ab-copy">
            This project is <strong>read-only</strong>. Restore it to import graphs, invite members, or make lifecycle changes.
          </div>
          {canManageProject ? (
            <button
              className="btn btn-sm"
              type="button"
              disabled={isUpdatingLifecycle}
              onClick={() => changeLifecycleStatus("active")}
            >
              {isUpdatingLifecycle ? "Restoring" : "Unarchive"}
            </button>
          ) : null}
        </div>
      ) : null}

      <header className="proj-header">
        <div className="title-row">
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {project.name}
          </h1>
          {isArchived ? (
            <button className="btn btn-sm" type="button" disabled>
              Import graph
            </button>
          ) : (
            <Link className="btn btn-sm" to={`/project/${project.id}/import`}>
              Import graph
            </Link>
          )}
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

      {lifecycleMessage ? (
        <div className="banner is-success workspace-banner">
          <div className="banner-mark" />
          <div className="banner-body">
            <span className="ban-title">Project updated</span>
            {lifecycleMessage}
          </div>
        </div>
      ) : null}

      <section className="project-lifecycle-panel" aria-labelledby="project-lifecycle-title">
        <div>
          <div className="section-kicker">§ Lifecycle</div>
          <h2 id="project-lifecycle-title">Project lifecycle</h2>
          <p>
            Archive finished engagements without deleting graphs, members, or project history. Archived projects move to the workspace archived tab.
          </p>
          {!canManageProject ? (
            <div className="members-gate lifecycle-gate">
              Only project owners can archive or restore this project.
            </div>
          ) : null}
        </div>
        <div className="project-lifecycle-actions">
          {isArchived ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={!canManageProject || isUpdatingLifecycle}
              onClick={() => changeLifecycleStatus("active")}
            >
              {isUpdatingLifecycle ? "Restoring..." : "Unarchive project"}
            </button>
          ) : (
            <button
              className="btn lifecycle-archive-btn"
              type="button"
              disabled={!canManageProject || isUpdatingLifecycle}
              onClick={() => changeLifecycleStatus("archived")}
            >
              {isUpdatingLifecycle ? "Archiving..." : "Archive project"}
            </button>
          )}
        </div>
      </section>

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
            {!isArchived ? (
              <Link className="add-card graph-card-add" to={`/project/${project.id}/import`}>
                <div className="plus">+</div>
                <div className="label">Import graph</div>
              </Link>
            ) : null}
          </div>
        ) : (
          isArchived ? (
            <div className="archived-empty">No graphs in this archived project</div>
          ) : (
            <EmptyGraphs projectId={project.id} />
          )
        )}
      </section>

      <section className={`panel${tab === "members" ? " is-on" : ""}`} id="membersPanel">
        {!canInvite ? (
          <div className="members-gate">
            Only the project owner can add, remove, or change member roles. You can see who else has access here.
          </div>
        ) : null}

        <div className="members-band">
          <div className="members-toggle">
            {["all", "owner", "editor", "viewer"].map((filter) => (
              <button
                key={filter}
                className={memberFilter === filter ? "is-on" : ""}
                type="button"
                onClick={() => setMemberFilter(filter)}
              >
                {filter === "all" ? "All" : `${ROLE_LABELS[filter]}s`} <span className="ct">{counts[filter]}</span>
              </button>
            ))}
          </div>
          {canInvite ? (
            <button className="btn btn-primary btn-sm" type="button" onClick={() => setIsInviteOpen(true)}>
              Add member...
            </button>
          ) : null}
        </div>

        {activeMembers.length === 1 && pendingInvitations.length === 0 ? (
          <EmptyMembers canInvite={canInvite} onInvite={() => setIsInviteOpen(true)} />
        ) : (
          <div className="members-card">
            <div className="head">
              <div>Member</div>
              <div>Email</div>
              <div>Role</div>
              <div />
            </div>
            {visibleMembers.map((member) => (
              <div className="row" key={member.user_id} data-role={member.role}>
                <div className="who">
                  <div className="av">{initials(member.email, member.name)}</div>
                  <div>
                    <div className="name">
                      {member.name || member.email}
                      {member.user_id === user?.id ? <span className="you-badge">YOU</span> : null}
                    </div>
                    <div className="email">{member.email}</div>
                  </div>
                </div>
                <div className="email">{member.email}</div>
                <div>
                  <span className={`role ${member.role}`}>{ROLE_LABELS[member.role] ?? member.role}</span>
                </div>
                <div className="actions" />
              </div>
            ))}
            {canInvite && pendingInvitations.length > 0 ? (
              <>
                <div className="members-card-section">§ Pending Invites</div>
                {pendingInvitations.map((invitation) => (
                  <div className="row pending-row" key={invitation.id} data-role="pending">
                    <div className="who">
                      <div className="av">{initials(invitation.invitee_email)}</div>
                      <div>
                        <div className="name">Pending invitation</div>
                        <div className="email">Expires {formatExpiry(invitation.expires_at)}</div>
                      </div>
                    </div>
                    <div className="email">{invitation.invitee_email}</div>
                    <div>
                      <span className={`role ${invitation.project_role}`}>
                        {ROLE_LABELS[invitation.project_role] ?? invitation.project_role}
                      </span>
                    </div>
                    <div className="actions">
                      <button className="icon-btn text-action" type="button" onClick={() => revokeInvitation(invitation.id)}>
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : null}
            {canInvite ? (
              <button className="members-add" type="button" onClick={() => setIsInviteOpen(true)}>
                <span className="ic">+</span>
                Add member
              </button>
            ) : null}
          </div>
        )}
      </section>

      <InviteModal
        existingEmails={existingEmails}
        inviteLinks={inviteLinks}
        isOpen={isInviteOpen}
        isSending={isSendingInvite}
        message={inviteMessage}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={sendInvitations}
        projectName={project.name}
      />
    </main>
  );
}
