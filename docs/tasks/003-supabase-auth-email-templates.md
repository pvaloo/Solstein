# Task 003 - Supabase Auth Email Templates

## Goal

Create Solstein-branded HTML and plain-text templates for Supabase Auth transactional emails so sign-up, password reset, and email verification messages match the current product design.

This task is only for Supabase Auth-owned emails. Project/team invitation delivery is a separate slice because invitations use Solstein's `project_invitations` table and custom `/invite/:token` flow.

## Scope

- Build a reusable email base template from the current Solstein visual system.
- Create Supabase Auth templates for:
  - Confirm signup
  - Reset password
  - Confirm email change / verify email
  - Magic link / OTP only if we keep those flows enabled
- Create plain-text fallbacks for every template.
- Document how to install templates in hosted Supabase and local Supabase.
- Decide whether production uses custom SMTP or a Supabase Send Email Auth Hook.
- Keep template copy aligned with `docs/email-copy.md`.

## Design Requirements

- Use the transactional email system documented in `docs/email-copy.md`.
- Preserve the Solstein email design language:
  - Crystal mark + SOLSTEIN wordmark header.
  - Amber section eyebrow, e.g. `§ Account Recovery`.
  - Uppercase display heading.
  - Dark background, restrained borders, Barlow-style typography fallback.
  - Outline CTA button with amber border.
  - Secondary tiny print and footer with Terms / Privacy links.
- Use table-based or conservative inline CSS that renders in common email clients.
- Do not depend on external CSS files or web fonts loading.
- Keep URLs visible in the plain-text fallback.

## Supabase Template Variables

Use Supabase Auth template variables instead of Solstein `{placeholder}` syntax in implementation files.

Expected mappings:

| Purpose | Supabase variable |
|---|---|
| Primary action link | `{{ .ConfirmationURL }}` |
| One-time token / OTP fallback | `{{ .Token }}` |
| User email | `{{ .Email }}` |
| Site URL | `{{ .SiteURL }}` |
| Redirect URL | `{{ .RedirectTo }}` |
| User metadata | `{{ .Data }}` |

Before implementation, verify the exact variables against current Supabase Auth template docs.

## Files To Create/Edit

- `emails/supabase/base.html`
- `emails/supabase/confirm-signup.html`
- `emails/supabase/confirm-signup.txt`
- `emails/supabase/reset-password.html`
- `emails/supabase/reset-password.txt`
- `emails/supabase/verify-email-change.html`
- `emails/supabase/verify-email-change.txt`
- `emails/supabase/magic-link.html` if magic links remain enabled
- `emails/supabase/magic-link.txt` if magic links remain enabled
- `docs/email-copy.md` if copy or variable names need tightening
- `docs/mvp-todo.md`
- `supabase/config.toml` if local Auth template configuration is added

## Acceptance Criteria

- Each Supabase Auth email has a branded HTML template and matching plain-text fallback.
- Templates use Supabase variables and do not contain unresolved Solstein `{placeholder}` tokens.
- CTA links use `{{ .ConfirmationURL }}` where Supabase owns the action.
- Local install instructions are documented.
- Hosted Supabase install instructions are documented, including dashboard/manual path and production email sender requirements.
- Template output is previewed in a browser or email-render preview and checked against the Solstein auth design.
- `npm run lint` and `npm run build` still pass if app files are touched.

## Things Not To Build Yet

- Project invitation email sending from `project_invitations`.
- Marketing/newsletter emails.
- Full notification preference center.
- New sign-in, password-changed, and account-deleted emails unless they are implemented outside Supabase Auth in the same slice.

## Migration / Env / DB Implications

- No database migration expected.
- Production will need a real sender path:
  - Preferred MVP option: configure Supabase custom SMTP with a verified Solstein sender domain.
  - Alternative: implement Supabase Send Email Auth Hook with Resend/Postmark.
- Required production env/secrets depend on the chosen sender provider and must not be committed.

## Test Plan

- Render each HTML template locally with sample Supabase variable values.
- Verify text fallback includes the raw action URL.
- Trigger Supabase local Auth signup and reset flows if local Supabase is running.
- Send test emails from hosted Supabase after custom SMTP/Auth Hook configuration.
- Check desktop and mobile-width rendering for no clipped text or broken CTA layout.
