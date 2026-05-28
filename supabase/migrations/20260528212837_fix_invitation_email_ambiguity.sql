create or replace function public.create_project_invitation(
  target_project_id uuid,
  invitee_email text,
  invite_project_role text default 'editor',
  invite_personal_note text default null
)
returns table (
  invitation_id uuid,
  email text,
  project_role text,
  token text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
#variable_conflict use_column
declare
  current_user_id uuid := auth.uid();
  requested_invitee_email text := trim($2);
  normalized_email text := lower(requested_invitee_email);
  raw_token text := encode(gen_random_bytes(32), 'hex');
  hashed_token text := encode(digest(raw_token, 'sha256'), 'hex');
  target_workspace_id uuid;
  existing_invitation_id uuid;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if normalized_email = '' or normalized_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Invitee email is invalid';
  end if;

  if invite_project_role not in ('owner', 'editor', 'viewer') then
    raise exception 'Project role is invalid';
  end if;

  if not public.is_project_owner(target_project_id) then
    raise exception 'Only project owners can invite members';
  end if;

  select p.workspace_id into target_workspace_id
  from public.projects p
  where p.id = target_project_id
    and p.status = 'active';

  if target_workspace_id is null then
    raise exception 'Project is not active';
  end if;

  select pi.id into existing_invitation_id
  from public.project_invitations pi
  where pi.project_id = target_project_id
    and pi.invitee_email_normalized = normalized_email
    and pi.status = 'pending'
  limit 1;

  if existing_invitation_id is not null then
    update public.project_invitations pi
    set
      inviter_user_id = current_user_id,
      invitee_email = requested_invitee_email,
      workspace_role = 'member',
      project_role = invite_project_role,
      token_hash = hashed_token,
      personal_note = nullif(invite_personal_note, ''),
      expires_at = now() + interval '7 days',
      revoked_by = null,
      revoked_at = null
    where pi.id = existing_invitation_id
    returning pi.id, pi.invitee_email, pi.project_role, raw_token, pi.expires_at
    into invitation_id, email, project_role, token, expires_at;
  else
    insert into public.project_invitations (
      workspace_id,
      project_id,
      inviter_user_id,
      invitee_email,
      invitee_email_normalized,
      workspace_role,
      project_role,
      token_hash,
      personal_note
    )
    values (
      target_workspace_id,
      target_project_id,
      current_user_id,
      requested_invitee_email,
      normalized_email,
      'member',
      invite_project_role,
      hashed_token,
      nullif(invite_personal_note, '')
    )
    returning project_invitations.id, project_invitations.invitee_email, project_invitations.project_role, raw_token, project_invitations.expires_at
    into invitation_id, email, project_role, token, expires_at;
  end if;

  return next;
end;
$$;
