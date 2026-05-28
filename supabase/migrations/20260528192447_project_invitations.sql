-- Project invitations for team-member access.

create table if not exists public.project_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  inviter_user_id uuid references auth.users(id) on delete set null,
  invitee_email text not null,
  invitee_email_normalized text not null,
  workspace_role text not null default 'member' check (workspace_role in ('member', 'external')),
  project_role text not null check (project_role in ('owner', 'editor', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  token_hash text not null,
  personal_note text,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists project_invitations_token_hash_key
on public.project_invitations (token_hash);

create unique index if not exists project_invitations_pending_project_email_key
on public.project_invitations (project_id, invitee_email_normalized)
where status = 'pending';

drop trigger if exists project_invitations_touch_updated_at on public.project_invitations;
create trigger project_invitations_touch_updated_at
before update on public.project_invitations
for each row execute function public.touch_updated_at();

create or replace function public.is_project_owner(target_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.projects p
    join public.project_members pm on pm.project_id = p.id
    join public.workspace_members wm on wm.workspace_id = p.workspace_id and wm.user_id = auth.uid()
    where p.id = target_project_id
      and p.status <> 'deleted'
      and pm.user_id = auth.uid()
      and pm.role = 'owner'
      and wm.status = 'active'
  );
$$;

alter table public.project_invitations enable row level security;

create policy "Project owners can read invitations"
on public.project_invitations for select
using (public.is_project_owner(project_id));

create policy "Project owners can create invitations"
on public.project_invitations for insert
with check (public.is_project_owner(project_id));

create policy "Project owners can update invitations"
on public.project_invitations for update
using (public.is_project_owner(project_id))
with check (public.is_project_owner(project_id));

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
declare
  current_user_id uuid := auth.uid();
  normalized_email text := lower(trim(create_project_invitation.invitee_email));
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
      invitee_email = trim(create_project_invitation.invitee_email),
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
      trim(create_project_invitation.invitee_email),
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

create or replace function public.list_project_invitations(target_project_id uuid)
returns table (
  id uuid,
  invitee_email text,
  project_role text,
  status text,
  expires_at timestamptz,
  created_at timestamptz,
  inviter_email text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    pi.id,
    pi.invitee_email,
    pi.project_role,
    case
      when pi.status = 'pending' and pi.expires_at <= now() then 'expired'
      else pi.status
    end as status,
    pi.expires_at,
    pi.created_at,
    p.email as inviter_email
  from public.project_invitations pi
  left join public.profiles p on p.user_id = pi.inviter_user_id
  where pi.project_id = target_project_id
    and public.is_project_owner(pi.project_id)
  order by pi.created_at desc;
$$;

create or replace function public.revoke_project_invitation(target_invitation_id uuid)
returns public.project_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  updated_invitation public.project_invitations;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into updated_invitation
  from public.project_invitations pi
  where pi.id = target_invitation_id;

  if updated_invitation.id is null then
    raise exception 'Invitation not found';
  end if;

  if not public.is_project_owner(updated_invitation.project_id) then
    raise exception 'Only project owners can revoke invitations';
  end if;

  update public.project_invitations pi
  set
    status = 'revoked',
    revoked_by = current_user_id,
    revoked_at = now()
  where pi.id = target_invitation_id
    and pi.status = 'pending'
  returning * into updated_invitation;

  return updated_invitation;
end;
$$;

create or replace function public.get_project_invitation(invite_token text)
returns table (
  invitation_id uuid,
  project_id uuid,
  project_name text,
  workspace_id uuid,
  workspace_name text,
  invitee_email text,
  project_role text,
  status text,
  expires_at timestamptz,
  inviter_email text,
  personal_note text
)
language sql
security definer
set search_path = public, extensions
stable
as $$
  select
    pi.id,
    pi.project_id,
    pr.name,
    pi.workspace_id,
    w.name,
    pi.invitee_email,
    pi.project_role,
    case
      when pi.status = 'pending' and pi.expires_at <= now() then 'expired'
      else pi.status
    end as status,
    pi.expires_at,
    p.email as inviter_email,
    pi.personal_note
  from public.project_invitations pi
  join public.projects pr on pr.id = pi.project_id
  join public.workspaces w on w.id = pi.workspace_id
  left join public.profiles p on p.user_id = pi.inviter_user_id
  where pi.token_hash = encode(digest(invite_token, 'sha256'), 'hex')
  limit 1;
$$;

create or replace function public.accept_project_invitation(invite_token text)
returns table (
  project_id uuid,
  workspace_id uuid,
  project_role text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  target_invitation public.project_invitations;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into current_email
  from auth.users
  where id = current_user_id;

  select * into target_invitation
  from public.project_invitations pi
  where pi.token_hash = encode(digest(invite_token, 'sha256'), 'hex')
  limit 1;

  if target_invitation.id is null then
    raise exception 'Invitation not found';
  end if;

  if target_invitation.status <> 'pending' then
    raise exception 'Invitation is no longer pending';
  end if;

  if target_invitation.expires_at <= now() then
    update public.project_invitations pi
    set status = 'expired'
    where pi.id = target_invitation.id;
    raise exception 'Invitation has expired';
  end if;

  if lower(coalesce(current_email, '')) <> target_invitation.invitee_email_normalized then
    raise exception 'Sign in with % to accept this invitation', target_invitation.invitee_email;
  end if;

  insert into public.profiles (user_id, email)
  values (current_user_id, coalesce(current_email, target_invitation.invitee_email))
  on conflict (user_id) do update
    set email = excluded.email;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (
    target_invitation.workspace_id,
    current_user_id,
    target_invitation.workspace_role,
    'active'
  )
  on conflict (workspace_id, user_id) do update
    set
      role = case
        when public.workspace_members.role = 'owner' then public.workspace_members.role
        else excluded.role
      end,
      status = 'active';

  insert into public.project_members (project_id, user_id, role)
  values (target_invitation.project_id, current_user_id, target_invitation.project_role)
  on conflict (project_id, user_id) do update
    set role = excluded.role;

  update public.project_invitations pi
  set
    status = 'accepted',
    accepted_by = current_user_id,
    accepted_at = now()
  where pi.id = target_invitation.id;

  project_id := target_invitation.project_id;
  workspace_id := target_invitation.workspace_id;
  project_role := target_invitation.project_role;
  return next;
end;
$$;
