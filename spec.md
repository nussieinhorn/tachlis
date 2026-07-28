# Tachlis — v1 Spec

Community problem-solving platform. Public issues, proposed solutions, voting, and public action tracking — from discussion to actually solved.

## Core objects

* **Workspace** — name, public/private, members. (v1: workspace concept exists in the data model, but the MVP surface is fully public — no private workspaces yet.)
* **Issue (Tachlis)** — title, description (rich text), category, location (optional text), splash image, status, created_by (user or anonymous), workspace_id
* **Solution** — title, description, pros/cons, issue_id, status (proposed / in-progress / chosen / rejected), created_by
* **Comment** — body, parent_type (issue / solution), parent_id, user_id, reply_to (threading)
* **Vote** — user_id, target_type (issue / solution), target_id
* **Join** — user_id, issue_id, intent tags (resonates / wants to join / passionate / willing to volunteer)
* **Action Plan** — issue_id, task list (title, status: not started / in progress / needs financing / stuck / done), progress %, team (project lead + volunteers)
* **Volunteer Application** — user_id or guest (name, email), issue_id, task_id, comment, approval status

## Issue lifecycle

New → Gaining Traction → Solutions Proposed → Solution Chosen → In Action → Resolved

Resolved issues move into a public "Solved" archive — the reusable knowledge-base layer for later.

## Pages

### Home (tachlis.org)

Feed of issue cards: category tag, name, supporter count, status badge, optional city/sub-community tag. Search + sort by popularity/recency. "Start your own" CTA.

### Create Issue (full-screen wizard, 4 steps)

1. Title + category picker (icon grid, "+ New category" as a tile) + location
2. Splash image (curated picks by category, or upload)
3. Description (short — title + a few sentences; full rich text/gallery editing happens later in admin edit)
4. Review + publish (preview exactly as it'll appear on the home feed)

### Issue detail page

* Name, description, splash image, status badge, supporter count
* Join button → intent-tag prompts (resonates / wants to join / passionate / willing to volunteer) — required before voting
* Solutions (cards, expandable/slide-out: description, votes, pros/cons)
* Updates panel — admin-posted changelog
* Discussion — open forum, issue-level, separate from per-solution comments

### Solution (slide-out / expanded card)

Description, votes, pros/cons, its own comment thread (separate from issue-level discussion)

### Decision state

When a solution is chosen: other solutions collapse behind "see other proposals," chosen one becomes the headline with vote count, action plan appears below. Visually distinct section — this is the key state transition in the product.

### Action plan

* Checklist with fixed task statuses (not started / in progress / needs financing / stuck / done)
* Overall progress bar
* Team panel: project lead + volunteers, publicly visible
* "I can help" button → popup (name, email, task, comment) → admin approval queue → approved volunteers added to visible team

## Admin / editing model (v1)

No real permission system yet. Single hardcoded admin login for the whole platform gates the Edit button — not per-issue roles. In edit mode, everything on the page becomes editable: issue name/description/rich text, action plan checklist, solution add/remove/reorder/hide, comment moderation. Public-submitted solutions go to an admin review queue before going live.

Real per-issue roles (admin / member) are a v2 problem.

## UI direction

Full-screen wizard for creation, not a form. Tabler outline icon set throughout (voting, feedback, categories, status) — consistent line weight, no mixed icon styles. Category tiles use icons + label, not text-only chips.

### Design system

* **Icons**: `@tabler/icons-react`, outline variant only, `stroke-width: 1.75` everywhere (wrapped in a shared `<Icon>` component to enforce this). 20px for inline/UI icons, 32px for category-picker tiles.
* **Component foundation**: shadcn/ui — style `new-york`, base color `neutral`, CSS-variable theming, `--radius: 0.75rem`. Core components: button, card, badge, dialog, sheet (solution slide-outs), tabs, avatar, progress (action plan bar), dropdown-menu, form/input/textarea.
* **Color direction**: optimistic warm (coral/orange primary on a warm-neutral base), light mode only for v1.

  | Token | Value | Use |
  |---|---|---|
  | `--primary` | `#F45D48` | CTAs, primary buttons, active vote state, "Start your own" |
  | `--primary-foreground` | `#FFFFFF` | text on primary |
  | `--background` | `#FFFDF9` | page background |
  | `--foreground` | `#241B16` | body text |
  | `--muted` | `#F2EBE4` | card backgrounds, subtle fills |
  | `--border` | `#E7DCD1` | dividers, card borders |

  Issue-lifecycle status badges get distinct hues so stage is scannable at a glance:

  | Stage | Color |
  |---|---|
  | New | gray `#8A8178` |
  | Gaining Traction | amber `#D98C1F` |
  | Solutions Proposed | blue `#3B7DD8` |
  | Solution Chosen | coral `#F45D48` |
  | In Action | violet `#8B5CF6` |
  | Resolved | green `#2F9E5B` |

* **Typography**: headings in Manrope, body/UI in Inter — both via `next/font/google`, self-hosted.
* **Dark mode**: out of scope for v1; shadcn's CSS-variable structure keeps it a future token swap, not a rearchitecture.

## Stack

Next.js + Supabase (Postgres, Auth, Realtime) + Tailwind, deployed on Vercel.

## Explicitly out of scope for v1

* Fundraising (one-time campaigns + ongoing funds) — phase 3, needs legal/merchant-of-record decisions first
* AI-suggested solutions from similar past issues — needs a real database of resolved issues first
* Voice notes, video
* Native mobile app — responsive web / PWA only
* Bulk contact invite / contact sync
* Nested workspaces
* Real per-issue permission roles beyond single-admin gate
* Fully anonymous + fully logged-out discussion — require at minimum name + email to comment

## Build sequence

1. Finalize this spec
2. Scaffold Next.js, push to GitHub, deploy to Vercel (get a live URL day one)
3. Supabase: schema + auth — before any real UI, not after
4. Auth (Supabase Auth, email/magic link) — every other table hangs off user_id
5. Build one vertical slice at a time, schema + RLS policy + UI together, not deferred:
   * Workspaces (public feed only for v1)
   * Issues (create via wizard, list, detail)
   * Solutions (create, vote, comment)
   * Comments (threaded, issue + solution level)
   * Join flow with intent tags
   * Action plan + volunteer applications
