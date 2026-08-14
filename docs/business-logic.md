# Tachlis — Business Logic Spec (Supabase Migration)

**Status:** Draft — checkpoint document, not final. More rounds of questions are still pending (see [Open Items](#open-items)). This document exists so the real business rules can be reviewed and corrected *before* any Supabase schema, auth, or RLS work begins.

**Why this document exists:** Batches 1–5 built a fully static/mock-data prototype — issues, solutions, communities, a fake sign-in system, and increasingly deep admin editing surfaces, all backed by session-local React state with `// TODO(supabase)` markers throughout the codebase. Several concepts that were simple placeholders in the prototype (a global "admin mode" toggle, a "submitted for review" message that saves nothing, an action plan that just exists because mock data says so) need real, decided logic before they can become database tables and RLS policies. This spec captures those decisions.

---

## Table of contents

1. [Auth & accounts](#auth--accounts)
2. [Ownership & permissions](#ownership--permissions)
3. [Issue visibility & security settings](#issue-visibility--security-settings)
4. [Solutions & the suggestion review queue](#solutions--the-suggestion-review-queue)
5. [Action Plan / Action Team triggering rules](#action-plan--action-team-triggering-rules)
6. [Requests inbox](#requests-inbox)
7. [Notifications](#notifications)
8. [Migration & cleanup principles](#migration--cleanup-principles)
9. [Open items](#open-items)

---

## Auth & accounts

- Real Supabase Auth. **Email + password only** for v1 — no magic link, no OAuth (Google, etc.).
- **Email confirmation is required** before an account can create, edit, or comment. Standard Supabase Auth confirmation-link flow.
- **Creating an issue always requires a real, confirmed account.** No anonymous issue creation, no exceptions.
- Other actions (supporting, voting, commenting) may or may not require login — see [Issue visibility & security settings](#issue-visibility--security-settings); that's a per-issue owner preference, not a global rule.

## Ownership & permissions

This replaces the prototype's global "admin mode" toggle entirely — that toggle is being removed, along with the "view as admin / view as user" site-wide switch it powered.

- **Every issue and community has an owner** — the account that created it.
- Owners can **grant other real accounts persistent, revocable edit access.** This is the real backing for the Team step's existing "Can update this issue" checkbox — instead of being collected and discarded (as it is in the prototype), it becomes a row in an `issue_editors`-style table that the owner (or super admin) can see and revoke later.
- **Communities follow the identical ownership model**: owner + optional granted editors, same as issues. One consistent mental model across both resource types.
- **The site owner's own email is the super admin** — full edit access to every issue and community, site-wide, no per-resource grant needed.
- Anyone with edit rights on a resource (owner, granted editor, or super admin) sees that resource's admin-level controls by default when viewing it.
- **New: a per-issue "View as Admin" / "View as User" toggle**, reachable from the issue's ⋮ menu. Lets someone with edit rights preview the public-facing view of their own issue — with a banner indicating they're in preview mode. This is the direct replacement for what the old global admin-mode toggle used to do, but it's now scoped to one issue at a time and only usable by someone who actually has rights to that issue (not a site-wide fake switch anyone could flip).

## Issue visibility & security settings

Most of this is already modeled in the Create Issue wizard's Settings step from the prototype; this section confirms what carries forward and what's new.

- **Public / Private** toggle stays as-is.
  - Private issues require: the visitor is logged in → they submit a request → the owner/admin approves it before they can view the issue. (Already built in the prototype as the private-issue gate + access-request flow — carries forward as real logic.)
  - Private communities stay **fully hidden** from non-owners/non-admins — not merely gated behind a "this is private" screen, actually absent from directory listings, search results, and issue-page community links. (Carries forward from the prototype unchanged.)
- **"Support requires login"** and **"Vote requires login"** — already exist as per-issue toggles in the prototype; confirmed to become real, server-enforced settings.
- **"Comments require login"** — **new** toggle, added alongside the existing **"Allow comments"** on/off switch. Same pattern as support/vote: "Allow comments" controls whether commenting exists on the issue at all; "Comments require login" controls whether anonymous visitors can post one when it's on.
- Because private data must actually be withheld from anyone who shouldn't see it (via Row Level Security), issue and community detail pages move from **static generation** (built once at deploy time, identical for everyone) to **per-request rendering**, checked against whoever is actually asking. This is a real architectural shift from the prototype's `generateStaticParams` approach.

## Solutions & the suggestion review queue

In the prototype, a non-admin's "suggest a solution" submission shows a fake "submitted for review" confirmation and saves absolutely nothing — there is no real queue anywhere. This becomes real:

- Suggested solutions from non-admins go into a **real pending queue**, invisible to the public until reviewed.
- The pending queue lives **inside the Solutions section of the issue itself** (not in the general [Requests inbox](#requests-inbox) — suggestions are a different kind of thing from access/join requests). It shows an indicator of how many new suggestions have come in since the admin/owner last checked.
- Reviewing a suggestion is a **one-step decision**:
  - **Accept** → the solution goes live *immediately*, publicly visible in the normal solutions list, tagged with status **"Considering"** (no separate staged/hidden holding area — accepting *is* publishing).
  - **Reject** → discarded.
- The AI-assisted pros/cons generation (with a "Regenerate" relabel once populated) plus manual pros/cons entry, both already built in the prototype, carry forward unchanged and apply to both admin-added and accepted user-suggested solutions.

## Action Plan / Action Team triggering rules

In the prototype, an issue's Action Plan (task list) and Action Team sections just exist because the mock data happens to include an `actionPlan` object — there is no real rule for when this should come into being. Real rule:

- **The first time ever** a solution on a given issue is marked **"Chosen,"** a one-time pop-up appears prompting the admin/owner to:
  1. **Pick the issue's new status** (required step in the pop-up).
  2. **Optionally start building the Action Plan's task list** right there in the same flow — they can add tasks immediately, or skip this and add tasks later through the already-built inline Action Plan editing (reorder, edit, hide, duplicate, delete, add).
- This pop-up is a **one-time "first decision" moment per issue** — it does *not* re-fire if the admin later changes which solution is marked chosen, or marks an additional one chosen. After the first time, status changes and Action Plan management happen through the normal, separate editing surfaces.
- Once this moment has occurred (whether tasks were added immediately or the admin skipped ahead), the Action Plan and Action Team sections become active and publicly visible on that issue.

## Requests inbox

Covers the two "someone is asking for something, an admin needs to approve or reject it" flows: **private-issue access requests** and **action-team join requests**.

- Surfaced through a **new header notification dropdown**, in a dedicated **"Requests"** tab (the dropdown's other tab is [Notifications](#notifications), below).
- The Requests tab is **only visible to users who own or have edit access to at least one issue or community** — a plain supporter with nothing to manage never sees it at all.
- Requests can be **expanded and approved individually**, or **"approve all" per issue** — bulk approval does not span multiple issues at once in a single click; it matches the existing per-issue "Approve all" pattern already built in the prototype.

## Notifications

The header dropdown's other tab, visible to **every logged-in user** (unlike Requests, which is admin/owner-only).

- **Triggers** (all four, notifying everyone currently supporting the relevant issue):
  1. Admin/owner posts an update.
  2. A solution is marked **Chosen**.
  3. The issue's status changes.
  4. A new solution is suggested (by anyone, not just admins).
- Each notification entry shows **what kind of event it is** and **which issue it's about**, including a title preview — since one user may be supporting many issues at once and needs to tell them apart at a glance.

## Migration & cleanup principles

These guide the eventual implementation plan, not just this document:

- **Every `// TODO(supabase)` marker in the current codebase represents a real write that must land in the database** once implemented — creating issues, creating communities, all edits, comments, solutions, everything currently held in session-local React state. Nothing should remain static/mock after the real migration is complete.
- **Status-change side effects must be explicit, documented rules** (like the Chosen → prompt trigger above) — not implicit behavior that only happens to work because of what the mock data contains.

## Open items

Still to be resolved in further rounds of questions before an implementation plan is written:

- Exact Supabase schema/table shape and naming.
- Hosting/environment setup — single Supabase project, or separate dev and production projects?
- Real-time vs. refetch-based updates (Supabase Realtime) — do votes/comments/notifications need to appear live without a page refresh?
- Whether to keep collecting phone numbers (team invites, action-team join requests, solution submitters) and, if so, what they're actually used for.
- Image/avatar uploads — the app currently has zero images anywhere by earlier explicit design decision. Confirm this stays true for v1 of the real system.
- Any remaining status-machine rules beyond the Chosen → prompt trigger already captured here — e.g. does issue status ever auto-advance on its own, or is it always a manual admin/owner action outside that one triggering moment?
