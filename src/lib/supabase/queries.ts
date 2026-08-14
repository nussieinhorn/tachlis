import { createClient } from "@/lib/supabase/server";
import { LOCATIONS, type Issue, type Solution, type Comment, type Update, type ActionPlan } from "@/lib/mock-data";
import type { Community } from "@/lib/communities-data";
import type { Database } from "@/lib/supabase/types";

type IssueRow = Database["public"]["Tables"]["issues"]["Row"];
type CommunityRow = Database["public"]["Tables"]["communities"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
type SolutionRow = Database["public"]["Tables"]["solutions"]["Row"] & {
  comments: CommentRow[];
  solution_votes: { count: number }[];
  submitter: { name: string; email: string } | null;
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function deriveLocationArea(location: string | null): Issue["locationArea"] {
  const match = LOCATIONS.find((loc) => loc !== "Worldwide" && location?.includes(loc));
  return match ?? "Worldwide";
}

function threadComments(rows: CommentRow[]): Comment[] {
  const byId = new Map<string, Comment>(
    rows.map((r) => [r.id, { id: r.id, author: r.author_name, body: r.body, createdAt: formatRelativeDate(r.created_at), replies: [] }]),
  );
  const roots: Comment[] = [];
  for (const r of rows) {
    const node = byId.get(r.id)!;
    const parent = r.parent_comment_id ? byId.get(r.parent_comment_id) : undefined;
    if (parent) parent.replies!.push(node);
    else roots.push(node);
  }
  return roots;
}

function mapSolution(row: SolutionRow): Solution {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    pros: row.pros,
    cons: row.cons,
    votes: row.solution_votes[0]?.count ?? 0,
    status: row.status as Solution["status"],
    comments: threadComments(row.comments),
    hidden: row.hidden,
    deleted: row.deleted,
    reviewStatus: row.review_status as Solution["reviewStatus"],
    submitter: row.submitter
      ? { name: row.submitter.name, email: row.submitter.email, phone: row.submitter_phone ?? undefined }
      : undefined,
  };
}

export function mapCommunity(row: CommunityRow, memberCount: number): Community {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    location: row.location ?? "",
    privacy: row.privacy as Community["privacy"],
    memberCount,
    tone: row.tone as Community["tone"],
    ownerId: row.owner_id ?? undefined,
  };
}

/** Member count proxy: distinct supporters across the community's issues (no dedicated membership table exists). */
async function getMemberCounts(communityIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (communityIds.length === 0) return counts;
  const supabase = await createClient();
  const { data: issues } = await supabase.from("issues").select("id, community_id").in("community_id", communityIds);
  if (!issues || issues.length === 0) return counts;
  const issueToCommunity = new Map(issues.map((i) => [i.id, i.community_id!]));
  const { data: supports } = await supabase
    .from("issue_supports")
    .select("issue_id, user_id")
    .in("issue_id", issues.map((i) => i.id));
  const seen = new Set<string>();
  for (const s of supports ?? []) {
    const communityId = issueToCommunity.get(s.issue_id);
    if (!communityId || !s.user_id) continue;
    const key = `${communityId}:${s.user_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    counts.set(communityId, (counts.get(communityId) ?? 0) + 1);
  }
  return counts;
}

export async function getCommunities(): Promise<Community[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("communities").select("*").order("created_at");
  if (error || !data) return [];
  const memberCounts = await getMemberCounts(data.map((c) => c.id));
  return data.map((row) => mapCommunity(row, memberCounts.get(row.id) ?? 0));
}

export async function getCommunity(id: string): Promise<Community | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("communities").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  const memberCounts = await getMemberCounts([id]);
  return mapCommunity(data, memberCounts.get(id) ?? 0);
}

export async function getCommunitiesOwnedBy(userId: string): Promise<Community[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("communities").select("*").eq("owner_id", userId).order("created_at");
  if (error || !data) return [];
  const memberCounts = await getMemberCounts(data.map((c) => c.id));
  return data.map((row) => mapCommunity(row, memberCounts.get(row.id) ?? 0));
}

export async function getCommunityIssueCount(id: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("issues").select("id", { count: "exact", head: true }).eq("community_id", id);
  return count ?? 0;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Community ids the current user may edit (owner, granted editor, or super admin) — for computing per-card canEdit without N RPC round trips. */
export async function getEditableCommunityIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return new Set();

  const { data: isSuperAdmin } = await supabase.rpc("is_super_admin");
  if (isSuperAdmin) {
    const { data } = await supabase.from("communities").select("id");
    return new Set((data ?? []).map((c) => c.id));
  }

  const [{ data: owned }, { data: edited }] = await Promise.all([
    supabase.from("communities").select("id").eq("owner_id", userData.user.id),
    supabase.from("community_editors").select("community_id").eq("user_id", userData.user.id),
  ]);
  return new Set([...(owned ?? []).map((c) => c.id), ...(edited ?? []).map((e) => e.community_id)]);
}

export async function getCommunityEditAccess(communityId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_community_edit_access", { p_community_id: communityId });
  return data ?? false;
}

export async function getIssueEditAccess(issueId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_issue_edit_access", { p_issue_id: issueId });
  return data ?? false;
}

/** Minimal id/title/visibility for an issue, bypassing RLS — used only to render the private-issue "request access" screen. */
export async function getIssueStub(issueId: string): Promise<{ id: string; title: string; visibility: string } | undefined> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_issue_stub", { p_issue_id: issueId });
  return data?.[0];
}

function mapIssueRow(row: IssueRow, supporterCount: number, ownerName?: string): Issue {
  return {
    id: row.id,
    communityId: row.community_id ?? undefined,
    title: row.title,
    description: row.description,
    descriptionMore: row.description_more ?? undefined,
    categorySlug: row.category_slug,
    locationArea: deriveLocationArea(row.location),
    location: row.location ?? "",
    status: row.status as Issue["status"],
    supporterCount,
    shareCount: row.share_count,
    visitCount: row.visit_count,
    viewCount: row.view_count,
    createdBy: ownerName ?? "",
    createdAt: formatRelativeDate(row.created_at),
    solutions: [],
    updates: [],
    discussion: [],
    visibility: row.visibility as Issue["visibility"],
    showOnHomepage: row.show_on_homepage,
    showInSearch: row.show_in_search,
    supportRequiresLogin: row.support_requires_login,
    voteRequiresLogin: row.vote_requires_login,
    allowSuggestSolutions: row.allow_suggest_solutions,
    commentsEnabled: row.comments_enabled,
    goLiveDate: row.go_live_date ?? undefined,
    votingCloseDate: row.voting_close_date ?? undefined,
    hiddenDate: row.hidden_date ?? undefined,
    showHiddenSolutionsAfterChosen: row.show_hidden_solutions_after_chosen,
  };
}

/** List view — lightweight, no nested solutions/comments. RLS already restricts to what the current viewer may see. */
export async function getIssues(): Promise<Issue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("issues").select("*, issue_supports(count)").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => {
    const { issue_supports, ...rest } = row as IssueRow & { issue_supports: { count: number }[] };
    return mapIssueRow(rest, issue_supports[0]?.count ?? 0);
  });
}

export async function getIssuesOwnedBy(userId: string): Promise<Issue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("issues")
    .select("*, issue_supports(count)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => {
    const { issue_supports, ...rest } = row as IssueRow & { issue_supports: { count: number }[] };
    return mapIssueRow(rest, issue_supports[0]?.count ?? 0);
  });
}

export async function getIssuesByCommunity(communityId: string): Promise<Issue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("issues")
    .select("*, issue_supports(count)")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => {
    const { issue_supports, ...rest } = row as IssueRow & { issue_supports: { count: number }[] };
    return mapIssueRow(rest, issue_supports[0]?.count ?? 0);
  });
}

export async function getIssue(id: string): Promise<Issue | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("issues")
    .select(
      `*,
      issue_supports(level, user_id),
      solutions(*, comments(*), solution_votes(count), submitter:profiles!solutions_submitted_by_fkey(name, email)),
      comments!comments_issue_id_fkey(*),
      issue_updates(*),
      issue_links(*),
      action_plans(*, action_tasks(*)),
      action_team_members(*),
      owner:profiles!issues_owner_id_fkey(name)`,
    )
    .eq("id", id)
    .is("comments.solution_id", null)
    .eq("solutions.deleted", false)
    .eq("solutions.review_status", "approved")
    .neq("action_team_members.status", "removed")
    .maybeSingle();

  if (error || !data) return undefined;

  const supports = data.issue_supports as { level: string; user_id: string | null }[];
  const supporterBreakdown = {
    justSupport: supports.filter((s) => s.level === "just-support").length,
    resonates: supports.filter((s) => s.level === "resonates").length,
    willingToHelp: supports.filter((s) => s.level === "willing-to-help").length,
  };

  const solutions = (data.solutions as unknown as SolutionRow[]).map(mapSolution);
  const chosenSolutionIds = solutions.filter((_, i) => (data.solutions as unknown as SolutionRow[])[i].is_chosen).map((s) => s.id);

  const updates: Update[] = (data.issue_updates as Database["public"]["Tables"]["issue_updates"]["Row"][])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((u) => ({ date: formatRelativeDate(u.created_at), body: u.body }));

  const actionPlanRow = data.action_plans as
    | (Database["public"]["Tables"]["action_plans"]["Row"] & {
        action_tasks: Database["public"]["Tables"]["action_tasks"]["Row"][];
      })
    | null;

  const actionTeamMembers = data.action_team_members as Database["public"]["Tables"]["action_team_members"]["Row"][];

  const actionPlan: ActionPlan | undefined = actionPlanRow
    ? {
        id: actionPlanRow.id,
        lead: actionPlanRow.lead_name ?? "",
        tasks: actionPlanRow.action_tasks
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status as ActionPlan["tasks"][number]["status"],
            hidden: t.hidden,
          })),
        volunteers: actionTeamMembers.filter((m) => m.status === "active").map((m) => m.name),
        teamMembers: actionTeamMembers.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          hidden: m.status === "hidden",
        })),
      }
    : undefined;

  const links = (data.issue_links as Database["public"]["Tables"]["issue_links"]["Row"][]).map((l) => ({
    id: l.id,
    label: l.label,
    url: l.url,
  }));

  const owner = data.owner as { name: string } | null;
  const issue = mapIssueRow(data as IssueRow, supports.length, owner?.name);
  return {
    ...issue,
    solutions,
    chosenSolutionIds: chosenSolutionIds.length > 0 ? chosenSolutionIds : undefined,
    updates,
    discussion: threadComments(data.comments as CommentRow[]),
    actionPlan,
    links: links.length > 0 ? links : undefined,
    supporterBreakdown,
    firstChosenPromptedAt: (data as IssueRow).first_chosen_prompted_at,
  };
}

/** Solutions awaiting admin review for an issue — invisible to the public, only fetchable by editors (enforced by RLS). */
export async function getPendingSolutions(issueId: string): Promise<Solution[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("solutions")
    .select("*, comments(*), solution_votes(count), submitter:profiles!solutions_submitted_by_fkey(name, email)")
    .eq("issue_id", issueId)
    .eq("review_status", "pending")
    .eq("deleted", false)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as SolutionRow[]).map(mapSolution);
}
