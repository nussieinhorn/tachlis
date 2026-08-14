# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tachlis — a community problem-solving platform (public issues → proposed solutions → voting → public action tracking, "from discussion to actually solved"). Full product spec lives in `spec.md`; the real business rules for the Supabase migration (auth, ownership/permissions, visibility settings, the solution review queue, Action Plan triggers, notifications) live in `docs/business-logic.md` — read that before touching auth, permissions, or any admin-approval flow.

**This codebase has two live states layered on top of each other right now, mid-migration:**
- `src/lib/mock-data.ts` and `src/lib/communities-data.ts` are the original static/session-only prototype data (22 issues, 15 communities) that most UI components still read from.
- `src/lib/supabase/` + a live Supabase project (`Tachlis`, ref `edoczobzfepqpyffifhd`) have a real schema with RLS applied, but most components haven't been rewired onto it yet.
- `src/lib/fake-session.tsx` and `src/lib/admin-mode.tsx` are the old fake-auth/fake-admin-toggle contexts being replaced by `src/lib/auth.tsx` (real Supabase Auth) and a real per-resource permission model. If you see a component still importing `useFakeSession`/`useAdminMode`, that's unmigrated — don't assume it reflects current intended behavior; check `docs/business-logic.md` for what it should actually do.

Any `// TODO(supabase): ...` comment in a component marks a write that still needs to become a real Supabase call.

## Commands

```bash
npm run dev              # start dev server (localhost:3000)
npm run build             # production build — also type-checks
npx tsc --noEmit           # type-check only, no build
```

No test suite or lint script is configured. There is no Supabase CLI installed locally — schema changes go through the Supabase MCP connector (`apply_migration`, `execute_sql`, `get_advisors` against project id `edoczobzfepqpyffifhd`), not `supabase db push` or migration files on disk.

## Architecture

**Stack:** Next.js App Router + TypeScript, Tailwind v4, hand-written shadcn/ui-style components (not CLI-installed — this network has blocked the shadcn CLI's transitive deps before), Tabler icons via a shared `<Icon>` wrapper that enforces consistent stroke width, Supabase (Postgres + Auth) for the backend.

**Rendering:** static pages use plain Server Components. `issues/[id]` and `communities/[id]` are mid-transition from static generation (`generateStaticParams`) to per-request rendering — private data must be checked against the actual requester via RLS, which static generation can't do. Don't add `generateStaticParams` back to either route.

**Data layer (`src/lib/supabase/`):**
- `client.ts` — browser Supabase client (`createBrowserClient`), for client components.
- `server.ts` — server Supabase client (`createServerClient`, reads cookies via `next/headers`), for Server Components/Route Handlers. Queries through this client run as the requesting user's session, so Postgres RLS does the actual visibility filtering — there's no app-level "is this private" branching to get wrong.
- `types.ts` — hand-maintained `Database` type (no `supabase gen types` locally; update this manually when the schema changes).
- `src/middleware.ts` refreshes the auth session cookie on every request — required for the server client to see a valid session.

**Auth & permissions:**
- `src/lib/auth.tsx` — real `useAuth()` hook (Supabase Auth: `signUp`/`signIn`/`signOut`, `onAuthStateChange`). Email + password only, email confirmation required (see `docs/business-logic.md`). The confirmation link hits `src/app/auth/confirm/route.ts`, which does the `verifyOtp` exchange.
- Permission model is **owner + granted editor + one hardcoded super admin**, not a role flag: `is_super_admin()` and `has_issue_edit_access()`/`has_community_edit_access()` Postgres functions (used both inside RLS policies and callable directly as RPCs) are the source of truth. There is no global "admin mode" toggle in the real system — `src/lib/admin-mode.tsx` is the old prototype version of this and is being phased out.
- Every resource (`issues`, `communities`) has an `owner_id` plus an `*_editors` grant table for delegated edit access — mirrors the Team-step "can update this issue" checkbox in the create-issue wizard.

**Database shape:** see `docs/business-logic.md` for the why; the tables themselves (all RLS-enabled) are `profiles`, `categories`, `communities`/`community_editors`, `issues`/`issue_editors`, `issue_supports`, `issue_links`, `issue_updates`, `solutions`/`solution_votes`, `comments` (one unified table for both issue- and solution-level threads, disambiguated by nullable `issue_id`/`solution_id` with a check constraint), `action_plans`/`action_tasks`/`action_team_members`/`action_team_requests`, `private_access_requests`, `issue_alert_subscriptions`, `notifications`. Notifications fan out via Postgres triggers on the originating event (e.g. inserting an `issue_updates` row fans out to every supporter/subscriber), not application code — don't try to also fan them out from the client.

**Component conventions (prototype-era, still load-bearing):**
- `src/components/ui/` — hand-written shadcn-style primitives (not generated by the shadcn CLI).
- `src/components/issue/` — everything scoped to a single issue's detail page (solution cards/drawer, action plan, action team, comments, admin dialogs). Most of the issue detail page's complexity lives here, not in `src/app/issues/[id]/page.tsx` itself.
- Dialogs in this codebase don't use Radix's `DialogTrigger`; they take a `trigger: ReactNode` prop, wrap it in `<span onClick={() => setOpen(true)}>`, and manage `open` state internally alongside a `reset(open)` function that clears form state on close. Follow this pattern for new dialogs rather than the shadcn default.
- Every "admin-only" or "owner-only" UI branch checks a permission hook/context — as this migrates off `useAdminMode()`, replace it with a real per-resource permission check (owner/editor/super-admin), not a global flag.
