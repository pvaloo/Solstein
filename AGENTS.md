# AGENTS.md

Codex-only instructions for this repository. This file captures the Solstein MVP workflow and does not replace user instructions.

By default, Codex is the implementation agent for this repository. When the user asks for a code change, make the requested change directly, keep the scope tight, and verify the result with the smallest useful local check.

## Priorities

1. Make the prototype runnable locally first.
2. Preserve the Solstein product intent documented in `docs/`.
3. Keep an explicit MVP page and functionality inventory.
4. Prefer small, verifiable implementation slices.
5. Avoid backend complexity until the viewer and core flows work end to end.

## Project Map

- This repo is currently a static Solstein prototype plus a React canvas loaded through `canvas.html`.
- `original_files/` is the immutable design/reference snapshot once the React app scaffold exists. Use it to verify visual parity and behavior intent, but do not edit it during normal implementation.
- Root `*.html` files are the source screens for the future app.
- `docs/` is the engineering handover and should be read before changing product structure.
- `docs/02-routes-and-navigation.md` maps static files to intended production routes.
- `docs/mvp-todo.md` is the living MVP inventory and implementation checklist.
- `src/` contains the substantive graph canvas implementation, currently written as browser globals and JSX files loaded by Babel.
- `data/car-insurance-comparison.json` is the sample graph payload.
- `solstein-tokens.css` is the visual contract. Do not introduce raw brand colors elsewhere unless first adding a token.

## Target Direction

- Build a working MVP with React, Supabase, and Vercel-compatible deployment.
- Use Vite + React as the default first implementation path unless the repo gains a stronger reason to use Next.js.
- Before porting pages, preserve the current prototype in `original_files/` so every route can be compared against its source design.
- Supabase should own auth, users, workspaces, projects, invitations, graphs, and operator data once backend work begins.
- The first MVP slice may use static JSON/localStorage where `docs/mvp-todo.md` explicitly marks a feature as "static-first".
- Deployment should be Vercel-friendly: `npm run build` must produce a deployable artifact.

## Token-Friendly Workflow

- Start with `rg --files`, targeted `rg`, and the relevant doc before opening large files.
- If the request mentions a page or route, start from `docs/02-routes-and-navigation.md`, then inspect the matching root HTML and likely future React component.
- When reviewing or porting UI, compare the React implementation against the matching file in `original_files/` and preserve class names/CSS structure where practical.
- If the request mentions graph/canvas behavior, start from `docs/04-canvas-data-model.md`, `docs/05-canvas-behaviour.md`, then the specific `src/` module.
- If the request mentions persistence, inspect `docs/09-state-and-persistence.md` before proposing schema or Supabase changes.
- Keep updates compact: changed files, behavior change, verification.

## Task Gate

Before broad implementation work, reduce the task to a small confirmed slice unless the user explicitly says to proceed. Use the format below for large or ambiguous work.

## Goal

A clear 1-2 sentence description of the task.

## Constraints

- Max 5 bullets
- Mention architecture, style, backend, auth, or deployment constraints that matter.

## Files to edit

- Exact file paths only.
- Include `docs/mvp-todo.md` when a page/functionality status changes.

## Files to read for context

- Only essential files to read before editing.
- Mark uncertain ones with `verify`.

## Acceptance criteria

- Concrete and testable outcomes.

## Things not to break

- Existing prototype screens, canvas behavior, route intent, design tokens, and documented role model.

## Migration / env / DB implications

- State `None` if not applicable.
- Otherwise list Supabase migrations, env vars, seeds, or Vercel settings.

## Test plan

- Use the smallest useful check: `npm run dev`, `npm run build`, targeted unit tests, or browser verification depending on the slice.

## Rules

- Keep `docs/mvp-todo.md` current when adding, removing, or completing pages and MVP functionality.
- Treat `original_files/` as read-only reference material. Do not edit, format, rename, or delete files in it unless the user explicitly asks to refresh the reference snapshot.
- Reviewers should use `original_files/` to check visual parity, missing interactions, copy differences, route behavior, and design-token drift.
- Do not delete prototype HTML until the replacement React route exists and has been checked.
- Do not introduce Supabase production credentials into the repo.
- Do not run destructive Supabase commands against linked projects.
- Prefer local Supabase for localhost development.
- Keep user-visible copy and route labels aligned with Solstein, not old FlowLens naming.
- Internal FlowLens names may remain during the initial port, but do not add new user-visible FlowLens references.
- Use `npm` as the default package manager once `package.json` exists.
- For frontend work, verify the app in a browser after starting the dev server when feasible.
