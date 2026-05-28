import { supabase } from "./supabaseClient.js";

function unavailableError() {
  return new Error("Supabase is not configured.");
}

export function inviteUrl(token) {
  if (!token) return "";
  return new URL(`/invite/${token}`, window.location.origin).toString();
}

export async function listProjectInvitations(projectId) {
  if (!supabase) {
    return { invitations: [], error: unavailableError() };
  }

  const { data, error } = await supabase.rpc("list_project_invitations", {
    target_project_id: projectId,
  });

  return { invitations: data ?? [], error };
}

export async function createProjectInvitations(projectId, emails, role, note) {
  if (!supabase) {
    return { invitations: [], error: unavailableError() };
  }

  const results = [];

  for (const email of emails) {
    const { data, error } = await supabase.rpc("create_project_invitation", {
      target_project_id: projectId,
      invitee_email: email,
      invite_project_role: role,
      invite_personal_note: note || null,
    });

    if (error) {
      return { invitations: results, error };
    }

    const invitation = data?.[0] ?? null;
    if (invitation) {
      results.push({
        ...invitation,
        invite_url: inviteUrl(invitation.token),
      });
    }
  }

  return { invitations: results, error: null };
}

export async function revokeProjectInvitation(invitationId) {
  if (!supabase) {
    return { invitation: null, error: unavailableError() };
  }

  const { data, error } = await supabase.rpc("revoke_project_invitation", {
    target_invitation_id: invitationId,
  });

  return { invitation: data, error };
}

export async function getProjectInvitation(token) {
  if (!supabase) {
    return { invitation: null, error: unavailableError() };
  }

  const { data, error } = await supabase.rpc("get_project_invitation", {
    invite_token: token,
  });

  return { invitation: data?.[0] ?? null, error };
}

export async function acceptProjectInvitation(token) {
  if (!supabase) {
    return { accepted: null, error: unavailableError() };
  }

  const { data, error } = await supabase.rpc("accept_project_invitation", {
    invite_token: token,
  });

  return { accepted: data?.[0] ?? null, error };
}
