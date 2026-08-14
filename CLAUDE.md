# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Tachlis — a community problem-solving platform (public issues → proposed solutions → voting → public action tracking, "from discussion to actually solved"). Full product spec lives in `spec.md`; the real business rules (auth, ownership/permissions, visibility settings, the solution review queue, Action Plan triggers, notifications) live in `docs/business-logic.md` — read that before touching auth, permissions, or any admin-approval flow.

**The Supabase migration is complete.** Every page and component reads and writes through `src/lib/supabase/`; there is no more mock/session-local data. `src/lib/mock-data.ts` and `src/lib/communities-data.ts` still exist, but only as shared TypeScript types (`Issue`, `Solution`, `Community`, etc.) plus small pieces of genuinely static, non-DB reference data (the category → icon map, the `LOCATIONS` filter list, community tone → Tailwind class map) — not seed content. If you're looking for the actual data, it's in Postgres.

## Commands

```bash
npm run dev              # start dev server (localhost:3000)
npm run build             # production build — also type-checks
npx tsc --noEmit           # type-check only, no build
```

No test suite or lint script is configured. There is no Supabase CLI installed locally — schema changes go through the Supabase MCP connector (`apply_migration`, `execute_sql`, `get_advisors` against project id `edoczobzfepqpyffifhd`), not `supabase db push` or migration files on disk.

## Architecture

**Stack:** Next.js App Router + TypeScript, Tailwind v4, hand-written shadcn/ui-style components (not CLI-installed — this network has blocked the shadcn CLI's transitive deps before), Tabler icons via a shared `<Icon>` wrapper that enforces consistent stroke width, Supabase (Postgres + Auth) for the backend.

**Rendering:** static pages use plain Server Components. `issues/[id]` and `communities/[id]` are per-request (no `generateStaticParams`) — private data is checked against the actual requester via RLS, which static generation can't do. Don't add `generateStaticParams` back to either route.

**Data layer (`src/lib/supabase/`):**
- `client.ts` — browser Supabase client (`createBrowserClient`), for client components. Writes (inserts/updates/deletes) happen here, directly from the component that triggers them, followed by `router.refresh()` to re-pull server data — there's no Server Actions layer.
- `server.ts` — server Supabase client (`createServerClient`, reads cookies via `next/headers`), for Server Components/Route Handlers. Queries through this client run as the requesting user's session, so Postgres RLS does the actual visibility filtering — there's no app-level "is this private" branching to get wrong.
- `queries.ts` — the read layer. Server-only (imports `server.ts`). Fetches DB rows and reshapes them into the same nested shapes (`Issue` with `.solutions[]`, `.actionPlan`, etc.) the UI already expects, using Supabase's embedded-select joins. Note: PostgREST embedded filters (`.eq("solutions.review_status", ...)`) only work one level deep — grandchild embeds (e.g. `action_plans.action_tasks`) can't be filtered this way and are filtered in JS after fetching instead.
- `types.ts` — generated via the Supabase MCP `generate_typescript_types` tool. Regenerate after any schema change rather than hand-editing.
- `src/middleware.ts` refreshes the auth session cookie on every request — required for the server client to see a valid session.

**Auth & permissions:**
- `src/lib/auth.tsx` — real `useAuth()` hook (Supabase Auth: `signUp`/`signIn`/`signOut`, `onAuthStateChange`). Email + password only, email confirmation required (see `docs/business-logic.md`). The confirmation link hits `src/app/auth/confirm/route.ts`, which does the `verifyOtp` exchange.
- Permission model is **owner + granted editor + one hardcoded super admin**, not a role flag: `is_super_admin()` and `has_issue_edit_access()`/`has_community_edit_access()` Postgres functions (used both inside RLS policies and callable directly as RPCs via `getIssueEditAccess()`/`getCommunityEditAccess()` in `queries.ts`) are the source of truth. Each page computes `canEdit` once server-side and threads it down as a prop — there is no global admin toggle anywhere in the app.
- Every resource (`issues`, `communities`) has an `owner_id` plus an `*_editors` grant table for delegated edit access — mirrors the Team-step "can update this issue" checkbox in the create-issue wizard.
- Private issues: `getIssue(id)` returns `undefined` if RLS blocks the row (not public, no approved access). The page then calls `getIssueStub(id)` — a `SECURITY DEFINER` RPC that returns just `{id, title, visibility}` bypassing RLS — to render the "request access" screen (`PrivateIssueGate`) instead of a bare 404, without leaking the issue's actual content.

**Database shape:** see `docs/business-logic.md` for the why; the tables themselves (all RLS-enabled) are `profiles`, `categories`, `communities`/`community_editors`, `issues`/`issue_editors`, `issue_supports`, `issue_links`, `issue_updates`, `solutions`/`solution_votes`, `comments` (one unified table for both issue- and solution-level threads, disambiguated by nullable `issue_id`/`solution_id` with a check constraint), `action_plans`/`action_tasks`/`action_team_members`/`action_team_requests`, `private_access_requests`, `issue_alert_subscriptions`, `notifications`. Notifications fan out via Postgres triggers on the originating event (e.g. inserting an `issue_updates` row fans out to every supporter/subscriber), not application code — don't try to also fan them out from the client.

**The "first solution chosen" flow:** the first time ever a solution on an issue is marked "Chosen" (`ChosenSolutionDialog`, triggered from `solution-card.tsx`'s status dropdown), a one-time popup requires picking the issue's new status and optionally seeding the Action Plan's task list, then sets `issues.first_chosen_prompted_at`. The Action Plan and Action Team sections on the issue page only render once that timestamp is set (`issue.firstChosenPromptedAt`) — matching business-logic.md's "these sections become active" rule. Subsequent chosen/un-chosen status changes on other solutions don't re-fire the popup.

**Header inbox (`src/components/inbox-dropdown.tsx`):** a bell icon next to the account menu, visible when signed in. Two tabs: Notifications (every signed-in user, reads `notifications`) and Requests (only shown if the user owns/edits at least one resource or has a pending request to review — aggregates pending `private_access_requests` and `action_team_requests` across all their issues/communities in one place, per business-logic.md's "Requests inbox" spec).

**Component conventions:**
- `src/components/ui/` — hand-written shadcn-style primitives (not generated by the shadcn CLI).
- `src/components/issue/` — everything scoped to a single issue's detail page (solution cards/drawer, action plan, action team, comments, admin dialogs). Most of the issue detail page's complexity lives here, not in `src/app/issues/[id]/page.tsx` itself.
- Dialogs in this codebase don't use Radix's `DialogTrigger`; they take a `trigger: ReactNode` prop, wrap it in `<span onClick={() => setOpen(true)}>`, and manage `open` state internally alongside a `reset(open)` function that clears form state on close. Follow this pattern for new dialogs rather than the shadcn default.
- Every "admin-only" or "owner-only" UI branch takes a `canEdit: boolean` prop computed by the nearest Server Component ancestor — don't reach for a context/hook for this, thread the prop.
