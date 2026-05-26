# Email Copy

Transactional email content for the six emails the product sends. All follow the same template:

- **From:** `Solstein <no-reply@solstein.com>`
- **Header:** Crystal mark + SOLSTEIN wordmark
- **Eyebrow:** category label in amber, e.g. `§ Workspace Invitation`
- **Heading:** display type, uppercase
- **Body paragraphs:** Barlow regular
- **CTA button:** outline with amber hairline border (renders as link in plain-text fallback)
- **Tiny print:** Barlow light, secondary colour
- **Footer:** © 2026 Solstein · Terms · Privacy

Placeholders use `{double-braces}`.

---

## 1. Workspace invitation

**Subject:** `{inviterName} invited you to Solstein`

**Eyebrow:** § Workspace Invitation

**Heading:** You're Invited

**Body:**
> **{inviterName}** has invited you to join the **{workspaceName}** workspace.
>
> Solstein helps consultancies map operational systems, surface risk, and produce client-ready graph deliverables.

**Info list:**
- Inviter: {inviterName}
- Workspace: {workspaceName}
- Expires: In 7 days

**CTA:** Accept Invitation → ({inviteLink})

**Tiny print:** If you weren't expecting this invitation, you can ignore this email. The link will expire and no account will be created.

---

## 2. Reset password

**Subject:** Reset your Solstein password

**Eyebrow:** § Account Recovery

**Heading:** Reset Password

**Body:**
> A password reset was requested for this account. Use the link below within 15 minutes.

**CTA:** Set New Password → ({resetLink})

**Callout:** **Didn't request this?** Ignore this email. Your password won't change unless the link is opened and a new password is set.

**Tiny print:** For your safety, this link expires in 15 minutes and can only be used once. Setting a new password will sign out all other sessions on this account.

---

## 3. Verify new email

**Subject:** Verify your new Solstein email

**Eyebrow:** § Email Verification

**Heading:** Verify Your Email

**Body:**
> Your Solstein account is changing its email to this address. Confirm by clicking the link below.

**Info list:**
- New: {newEmail}
- Previous: {previousEmail}
- Expires: In 24 hours

**CTA:** Verify Email → ({verifyLink})

**Tiny print:** Until verified, your account remains under the previous email and you'll be signed out of all sessions. If you didn't request this change, ignore this email — no change will take effect.

---

## 4. Password changed (security notice)

**Subject:** Your Solstein password was changed

**Eyebrow:** § Security Notice

**Heading:** Password Changed

**Body:**
> The password on your Solstein account was changed. All other sessions have been signed out.

**Info list:**
- When: {timestamp UTC}
- Device: {userAgent summary}
- Location: {geo}

**Callout:** **Wasn't you?** Your account may be compromised. Reset your password and review your active sessions immediately.

**CTA:** Review Activity → ({sessionsLink})

**Tiny print:** If you made this change, no further action is needed.

---

## 5. New sign-in (security notice)

**Subject:** New sign-in to your Solstein account

**Eyebrow:** § Security Notice

**Heading:** New Sign-In

**Body:**
> Your Solstein account was signed into. If this was you, no action is needed.

**Info list:**
- When: {timestamp UTC}
- Device: {userAgent summary}
- Location: {geo}
- IP: {ipAddress} (monospace)

**CTA:** Revoke This Session → ({revokeLink})

**Tiny print:** Sign-in notifications are sent for every successful authentication, on every device. You can review all active sessions from Profile → Sessions.

---

## 6. Account deleted

**Subject:** Your Solstein account has been deleted

**Eyebrow:** § Final Notice

**Heading:** Account Deleted

**Body:**
> Your Solstein account has been permanently deleted. All projects, graphs, uploads, and audit entries tied to your identity have been removed.

**Info list:**
- When: {timestamp UTC}
- Account ID: {accountId} (monospace)
- Reference: {deletionRef} (monospace)

**Callout:** **This cannot be undone.** No copies are retained. If you need access in future, you'll need a new invitation from a workspace administrator.

**Tiny print:** We kept this email as audit confirmation. Reference number can be quoted in any future support contact.

---

## Implementation notes

- Use a single base template; differentiate by **eyebrow**, **heading**, and **body**.
- All security-related emails (password changed, new sign-in, password reset, email verify, account deleted) **send regardless of user notification preferences**. They're not marketing.
- Workspace invitations expire in **7 days**; reset links in **15 minutes**; verify-email links in **24 hours**.
- Sign-in notifications fire on **every** successful authentication on **every** device, no debouncing. Users can review and revoke individual sessions from Profile → Sessions.
- Account deletion email is the **only** retained communication after a delete — the user record itself is gone.
- Plain-text fallback should preserve every CTA URL inline (e.g. "Accept Invitation: https://...").
- Production should rebuild these in whatever template engine you use (MJML, Mustache, etc.). The brand spec for emails — header lockup, eyebrow, callout, button, footer — lives in `brand-system.md`.
