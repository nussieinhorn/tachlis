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

**Header inbox (`src/components/inbox-dropdown.tsx`):** a bell icon next to the account menu, visible when signed in. Two tabs: Notifications (every signed-in user, reads `notifications`, plain reverse-chronological feed with a relative timestamp per row — no read/unread state) and Requests (shown if the user owns or edits at least one issue/community, or is the super admin — aggregates pending `private_access_requests`, `community_access_requests`, and `action_team_requests` across all their issues/communities, each showing the requester's name/email/message and contextual action buttons).

**Short display IDs:** `issues.display_code` / `solutions.display_code` / `communities.display_code` are unique 4-digit zero-padded text columns (Postgres column defaults pull from a per-table sequence) used in URLs and UI display. The real `id` (uuid) stays the actual primary/foreign key everywhere internally — routes resolve `getIssue()`/`getCommunity()` by `display_code`, but any FK-following lookup (e.g. an issue's linked community) uses the real uuid via `getCommunityByInternalId()`. `get_issue_stub()` also takes `p_display_code` for the same reason — a blocked-by-RLS private issue can only be resolved by the `SECURITY DEFINER` stub, not a direct table read.

**Access model — edit vs. view-and-support:** no separate "role" column. "Edit" tier = a row in `issue_editors`/`community_editors` (unchanged, gates `canEdit`). "View-and-support" tier = an `'approved'` row in `private_access_requests` / `community_access_requests` with **no** matching editors row. `status` on both request tables is plain text (`'pending' | 'approved' | 'rejected' | 'revoked'`) — a requester can re-request after rejection/revocation via a dedicated RLS policy that only allows flipping their own row from `rejected`/`revoked` back to `pending`. `community_access_requests` is new — communities previously had no join-request flow at all (owner-invite-only); this is a deliberate expansion so communities get the same active/pending/revoked model as issues.

**Share/access panel (`src/components/share-access-panel.tsx`):** the single "Share" button on both issue and community pages, branching on `visibility`/`privacy`. Public → the existing link-share dialog (`issue/share-panel.tsx`, generalized to take a `title` prop, works for both resource types). Private → active/pending/revoked access management: grant-by-email (Viewer or Editor), approve pending requests as Viewer or Editor, reject, revoke. Replaces the old `community-invite-panel.tsx` and `issue/access-requests-widget.tsx` (both deleted).

**Action Plan visibility:** `issues.action_plan_visible` (default `false`) is independent of `first_chosen_prompted_at`. Editors always see the Action Plan/Team once `first_chosen_prompted_at` is set; the public only sees them once `action_plan_visible` is also true. `ChosenSolutionDialog` seeding tasks does not auto-publish — publishing is a separate toggle (`ActionPlanVisibilityToggle`, shown inline to editors on the issue page).

**Auth:** `useAuth()` also exposes `resetPassword(email)` (Supabase `resetPasswordForEmail`, redirects through the existing `/auth/confirm` route with `type=recovery` into `/auth/reset-password`) and a `rememberMe` param on `signIn()` — unchecked rewrites the session cookie to be session-only instead of the 400-day default. `signIn`/`signOut` both force a fresh `getUser()` call afterward so switching accounts in the same tab doesn't leave a stale cached session behind. Any `AuthGate` embedded directly inside a Server Component page (not a client dialog) needs `onSignedIn={() => router.refresh()}` or the page keeps showing the sign-in form after a successful sign-in — use the `AuthGateRefresh` wrapper (`src/components/auth-gate-refresh.tsx`) for that case rather than raw `AuthGate`.

**Component conventions:**
- `src/components/ui/` — hand-written shadcn-style primitives (not generated by the shadcn CLI).
- `src/components/issue/` — everything scoped to a single issue's detail page (solution cards/drawer, action plan, action team, comments, admin dialogs). Most of the issue detail page's complexity lives here, not in `src/app/issues/[id]/page.tsx` itself.
- Dialogs in this codebase don't use Radix's `DialogTrigger`; they take a `trigger: ReactNode` prop, wrap it in `<span onClick={() => setOpen(true)}>`, and manage `open` state internally alongside a `reset(open)` function that clears form state on close. Follow this pattern for new dialogs rather than the shadcn default.
- Every "admin-only" or "owner-only" UI branch takes a `canEdit: boolean` prop computed by the nearest Server Component ancestor — don't reach for a context/hook for this, thread the prop.
