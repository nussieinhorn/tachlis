"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconBell,
  IconBulb,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconFlag,
  IconSpeakerphone,
  IconX,
} from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationRow = {
  id: string;
  type: string;
  issueCode: string;
  issueTitle: string;
  createdAt: string;
  payload: Record<string, unknown> | null;
};

type RequestRow = {
  id: string;
  kind: "private_access" | "action_team" | "community_access";
  targetId: string;
  targetCode: string;
  targetTitle: string;
  userId: string | null;
  name: string;
  email: string;
  message: string | null;
};

const NOTIFICATION_LABEL: Record<string, string> = {
  update_posted: "posted an update",
  solution_chosen: "chose a solution",
  status_changed: "changed the status",
  solution_suggested: "got a new suggested solution",
};

function notificationText(n: NotificationRow): string {
  const payload = n.payload;
  switch (n.type) {
    case "status_changed":
      return payload?.label ? `Status changed to "${payload.label}"` : "changed the status";
    case "solution_chosen":
      return payload?.solution_title ? `Chose "${payload.solution_title}" as the solution` : "chose a solution";
    case "solution_suggested":
      return payload?.solution_title ? `New solution suggested: "${payload.solution_title}"` : "got a new suggested solution";
    case "update_posted":
      return payload?.excerpt ? `Posted an update: "${payload.excerpt}"` : "posted an update";
    default:
      return NOTIFICATION_LABEL[n.type] ?? "updated this issue";
  }
}

export function InboxDropdown() {
  const { user, isSignedIn } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"notifications" | "requests">("notifications");
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    const supabase = createClient();

    supabase
      .from("notifications")
      .select("id, type, created_at, payload, issue:issues(display_code, title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setNotifications(
          (data ?? []).map((n) => {
            const issue = n.issue as { display_code: string; title: string } | null;
            return {
              id: n.id,
              type: n.type,
              issueCode: issue?.display_code ?? "",
              issueTitle: issue?.title ?? "",
              createdAt: n.created_at,
              payload: n.payload as Record<string, unknown> | null,
            };
          }),
        );
      });

    Promise.all([
      supabase
        .from("private_access_requests")
        .select("id, user_id, issue:issues(id, display_code, title), requester:profiles!private_access_requests_user_id_fkey(name, email)")
        .eq("status", "pending"),
      supabase
        .from("community_access_requests")
        .select("id, user_id, community:communities(id, display_code, name), requester:profiles!community_access_requests_user_id_fkey(name, email)")
        .eq("status", "pending"),
      supabase
        .from("action_team_requests")
        .select("id, name, email, message, issue:issues(id, display_code, title)")
        .eq("status", "pending"),
      supabase.rpc("is_super_admin"),
      supabase.from("issues").select("id").eq("owner_id", user.id),
      supabase.from("issue_editors").select("issue_id").eq("user_id", user.id),
      supabase.from("communities").select("id").eq("owner_id", user.id),
      supabase.from("community_editors").select("community_id").eq("user_id", user.id),
    ]).then(([pa, ca, atr, isSuperAdmin, ownedIssues, editedIssues, ownedCommunities, editedCommunities]) => {
      const paRows: RequestRow[] = (pa.data ?? []).map((r) => {
        const issue = r.issue as { id: string; display_code: string; title: string } | null;
        const requester = r.requester as { name: string; email: string } | null;
        return {
          id: r.id,
          kind: "private_access",
          targetId: issue?.id ?? "",
          targetCode: issue?.display_code ?? "",
          targetTitle: issue?.title ?? "",
          userId: r.user_id,
          name: requester?.name ?? "",
          email: requester?.email ?? "",
          message: null,
        };
      });
      const caRows: RequestRow[] = (ca.data ?? []).map((r) => {
        const community = r.community as { id: string; display_code: string; name: string } | null;
        const requester = r.requester as { name: string; email: string } | null;
        return {
          id: r.id,
          kind: "community_access",
          targetId: community?.id ?? "",
          targetCode: community?.display_code ?? "",
          targetTitle: community?.name ?? "",
          userId: r.user_id,
          name: requester?.name ?? "",
          email: requester?.email ?? "",
          message: null,
        };
      });
      const atrRows: RequestRow[] = (atr.data ?? []).map((r) => {
        const issue = r.issue as { id: string; display_code: string; title: string } | null;
        return {
          id: r.id,
          kind: "action_team",
          targetId: issue?.id ?? "",
          targetCode: issue?.display_code ?? "",
          targetTitle: issue?.title ?? "",
          userId: null,
          name: r.name,
          email: r.email,
          message: r.message,
        };
      });

      const ownedIssueIds = new Set((ownedIssues.data ?? []).map((i) => i.id));
      const editedIssueIds = new Set((editedIssues.data ?? []).map((e) => e.issue_id));
      const ownedCommunityIds = new Set((ownedCommunities.data ?? []).map((c) => c.id));
      const editedCommunityIds = new Set((editedCommunities.data ?? []).map((e) => e.community_id));
      const hasAnyManagedResource =
        isSuperAdmin.data === true ||
        ownedIssueIds.size > 0 ||
        editedIssueIds.size > 0 ||
        ownedCommunityIds.size > 0 ||
        editedCommunityIds.size > 0;

      setRequests([...paRows, ...caRows, ...atrRows]);
      setCanManage(hasAnyManagedResource);
    });
  }, [open, user]);

  const [roleChoice, setRoleChoice] = useState<Record<string, "viewer" | "editor">>({});
  const roleFor = (id: string) => roleChoice[id] ?? "viewer";

  async function approvePrivateAccess(id: string) {
    const supabase = createClient();
    const request = requests.find((r) => r.id === id);
    const role = roleFor(id);
    await supabase.from("private_access_requests").update({ status: "approved" }).eq("id", id);
    if (role === "editor" && request?.userId) {
      await supabase.from("issue_editors").insert({ issue_id: request.targetId, user_id: request.userId });
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  async function rejectPrivateAccess(id: string) {
    const supabase = createClient();
    await supabase.from("private_access_requests").update({ status: "rejected" }).eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  async function approveCommunityAccess(id: string) {
    const supabase = createClient();
    const request = requests.find((r) => r.id === id);
    const role = roleFor(id);
    await supabase.from("community_access_requests").update({ status: "approved" }).eq("id", id);
    if (role === "editor" && request?.userId) {
      await supabase.from("community_editors").insert({ community_id: request.targetId, user_id: request.userId });
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  async function rejectCommunityAccess(id: string) {
    const supabase = createClient();
    await supabase.from("community_access_requests").update({ status: "rejected" }).eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  async function approveActionTeam(id: string) {
    const supabase = createClient();
    const request = requests.find((r) => r.id === id);
    if (!request) return;
    await supabase.from("action_team_members").insert({
      issue_id: request.targetId,
      name: request.name,
      email: request.email,
      role: "volunteer",
      status: "active",
    });
    await supabase.from("action_team_requests").update({ status: "approved" }).eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  async function rejectActionTeam(id: string) {
    const supabase = createClient();
    await supabase.from("action_team_requests").update({ status: "rejected" }).eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  if (!isSignedIn) return null;

  const TYPE_ICON = {
    update_posted: IconSpeakerphone,
    solution_chosen: IconCircleCheck,
    status_changed: IconFlag,
    solution_suggested: IconBulb,
  } as const;

  const tabs: { key: "notifications" | "requests"; label: string; count?: number }[] = [
    { key: "notifications", label: "Notifications" },
    ...(canManage ? [{ key: "requests" as const, label: "Requests", count: requests.length }] : []),
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Notifications"
        >
          <Icon icon={IconBell} size={20} />
          {requests.length > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] leading-none font-bold text-primary-foreground ring-2 ring-background">
              {requests.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[26rem] overflow-hidden rounded-2xl p-0 shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="type-panel">Inbox</h2>
          <div className="inline-flex gap-1 rounded-full bg-muted p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {t.count ? (
                  <span className="rounded-full bg-primary px-1.5 py-px text-[10px] leading-none text-primary-foreground">
                    {t.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {tab === "notifications" && (
          <div className="flex max-h-[26rem] flex-col gap-0.5 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon icon={IconBell} size={22} />
                </span>
                <p className="type-label">You&apos;re all caught up</p>
                <p className="text-xs text-muted-foreground">Updates on the issues you follow will show up here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/issues/${n.issueCode}`}
                  className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/70"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon icon={TYPE_ICON[n.type as keyof typeof TYPE_ICON] ?? IconBell} size={18} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">{notificationText(n)}</span>
                    <span className="truncate text-xs text-muted-foreground">{n.issueTitle}</span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
                </Link>
              ))
            )}
          </div>
        )}

        {canManage && tab === "requests" && (
          <div className="flex max-h-[26rem] flex-col gap-2 overflow-y-auto p-3">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon icon={IconCheck} size={22} />
                </span>
                <p className="type-label">No pending requests</p>
              </div>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                      {(r.name || "?").trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">{r.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{r.email}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.kind === "private_access" && "wants access to "}
                        {r.kind === "community_access" && "wants to join "}
                        {r.kind === "action_team" && "wants to join the team on "}
                        <Link
                          href={`/${r.kind === "community_access" ? "communities" : "issues"}/${r.targetCode}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {r.targetTitle}
                        </Link>
                      </span>
                      {r.message && <span className="mt-1 text-xs text-foreground/80">&quot;{r.message}&quot;</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {(r.kind === "private_access" || r.kind === "community_access") && (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex h-8 items-center gap-1 rounded-full border border-border px-3 text-xs font-bold capitalize text-foreground transition-colors hover:bg-muted"
                            >
                              {roleFor(r.id)}
                              <Icon icon={IconChevronDown} size={12} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => setRoleChoice((prev) => ({ ...prev, [r.id]: "viewer" }))}>
                              Viewer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleChoice((prev) => ({ ...prev, [r.id]: "editor" }))}>
                              Editor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full"
                          aria-label="Reject"
                          onClick={() => (r.kind === "private_access" ? rejectPrivateAccess(r.id) : rejectCommunityAccess(r.id))}
                        >
                          <Icon icon={IconX} size={14} />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-full"
                          aria-label="Approve"
                          onClick={() => (r.kind === "private_access" ? approvePrivateAccess(r.id) : approveCommunityAccess(r.id))}
                        >
                          <Icon icon={IconCheck} size={14} />
                          Approve
                        </Button>
                      </>
                    )}
                    {r.kind === "action_team" && (
                      <>
                        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => rejectActionTeam(r.id)}>
                          <Icon icon={IconX} size={14} />
                          Decline
                        </Button>
                        <Button size="sm" className="rounded-full" onClick={() => approveActionTeam(r.id)}>
                          <Icon icon={IconCheck} size={14} />
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
