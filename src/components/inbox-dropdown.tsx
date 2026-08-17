"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBell } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationRow = {
  id: string;
  type: string;
  issueCode: string;
  issueTitle: string;
  createdAt: string;
};

type RequestRow = {
  id: string;
  kind: "private_access" | "action_team" | "community_access";
  targetId: string;
  targetCode: string;
  targetTitle: string;
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

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
      .select("id, type, created_at, issue:issues(display_code, title)")
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
            };
          }),
        );
      });

    Promise.all([
      supabase
        .from("private_access_requests")
        .select("id, issue:issues(id, display_code, title), requester:profiles!private_access_requests_user_id_fkey(name, email)")
        .eq("status", "pending"),
      supabase
        .from("community_access_requests")
        .select("id, community:communities(id, display_code, name), requester:profiles!community_access_requests_user_id_fkey(name, email)")
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

  async function approvePrivateAccess(id: string) {
    const supabase = createClient();
    await supabase.from("private_access_requests").update({ status: "approved" }).eq("id", id);
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
    await supabase.from("community_access_requests").update({ status: "approved" }).eq("id", id);
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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Notifications"
        >
          <Icon icon={IconBell} size={20} />
          {requests.length > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "notifications" | "requests")}>
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {canManage && <TabsTrigger value="requests">Requests {requests.length > 0 && `(${requests.length})`}</TabsTrigger>}
          </TabsList>
          <TabsContent value="notifications" className="flex max-h-96 flex-col gap-1 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/issues/${n.issueCode}`}
                  className="flex flex-col gap-0.5 rounded-lg px-2 py-2 hover:bg-accent"
                >
                  <span className="truncate text-xs font-medium text-primary">{n.issueTitle}</span>
                  <span className="flex items-center justify-between gap-2 text-sm text-foreground">
                    <span>{NOTIFICATION_LABEL[n.type] ?? "updated this issue"}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(n.createdAt)}</span>
                  </span>
                </Link>
              ))
            )}
          </TabsContent>
          {canManage && (
            <TabsContent value="requests" className="flex max-h-96 flex-col gap-2 overflow-y-auto p-2">
              {requests.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No pending requests.</p>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="flex flex-col gap-1.5 rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-foreground">{r.name}</span>
                      <span className="text-xs text-muted-foreground">{r.email}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.kind === "private_access" && "wants access to "}
                        {r.kind === "community_access" && "wants to join "}
                        {r.kind === "action_team" && "wants to join the team on "}
                        <Link href={`/${r.kind === "community_access" ? "communities" : "issues"}/${r.targetCode}`} className="font-medium text-primary hover:underline">
                          {r.targetTitle}
                        </Link>
                      </span>
                      {r.message && <span className="mt-1 text-xs text-foreground/80">&quot;{r.message}&quot;</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.kind === "private_access" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => approvePrivateAccess(r.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => rejectPrivateAccess(r.id)}>
                            Reject
                          </Button>
                        </>
                      )}
                      {r.kind === "community_access" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => approveCommunityAccess(r.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => rejectCommunityAccess(r.id)}>
                            Reject
                          </Button>
                        </>
                      )}
                      {r.kind === "action_team" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => approveActionTeam(r.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => rejectActionTeam(r.id)}>
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          )}
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
