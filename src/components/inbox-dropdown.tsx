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
  issueId: string;
  issueTitle: string;
  readAt: string | null;
};

type RequestRow = {
  id: string;
  kind: "private_access" | "action_team";
  issueId: string;
  issueTitle: string;
  name: string;
};

const NOTIFICATION_LABEL: Record<string, string> = {
  update_posted: "posted an update on",
  solution_chosen: "chose a solution for",
  status_changed: "changed the status of",
  solution_suggested: "got a new suggested solution on",
};

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
      .select("id, type, read_at, issue:issues(id, title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setNotifications(
          (data ?? []).map((n) => {
            const issue = n.issue as { id: string; title: string } | null;
            return { id: n.id, type: n.type, issueId: issue?.id ?? "", issueTitle: issue?.title ?? "", readAt: n.read_at };
          }),
        );
      });

    Promise.all([
      supabase
        .from("private_access_requests")
        .select("id, issue:issues(id, title), requester:profiles!private_access_requests_user_id_fkey(name)")
        .eq("status", "pending"),
      supabase
        .from("action_team_requests")
        .select("id, name, issue:issues(id, title)")
        .eq("status", "pending"),
      supabase.from("issues").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
      supabase.from("communities").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
    ]).then(([pa, atr, ownedIssues, ownedCommunities]) => {
      const paRows: RequestRow[] = (pa.data ?? []).map((r) => {
        const issue = r.issue as { id: string; title: string } | null;
        const requester = r.requester as { name: string } | null;
        return { id: r.id, kind: "private_access", issueId: issue?.id ?? "", issueTitle: issue?.title ?? "", name: requester?.name ?? "" };
      });
      const atrRows: RequestRow[] = (atr.data ?? []).map((r) => {
        const issue = r.issue as { id: string; title: string } | null;
        return { id: r.id, kind: "action_team", issueId: issue?.id ?? "", issueTitle: issue?.title ?? "", name: r.name };
      });
      setRequests([...paRows, ...atrRows]);
      setCanManage((ownedIssues.count ?? 0) > 0 || (ownedCommunities.count ?? 0) > 0 || paRows.length > 0 || atrRows.length > 0);
    });
  }, [open, user]);

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
  }

  async function approvePrivateAccess(id: string) {
    const supabase = createClient();
    await supabase.from("private_access_requests").update({ status: "approved" }).eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  async function approveActionTeam(id: string) {
    const supabase = createClient();
    const request = requests.find((r) => r.id === id);
    if (!request) return;
    const { data: fullRequest } = await supabase
      .from("action_team_requests")
      .select("issue_id, name, email, phone")
      .eq("id", id)
      .single();
    if (fullRequest) {
      await supabase.from("action_team_members").insert({
        issue_id: fullRequest.issue_id,
        name: fullRequest.name,
        email: fullRequest.email,
        phone: fullRequest.phone,
        role: "volunteer",
        status: "active",
      });
    }
    await supabase.from("action_team_requests").update({ status: "approved" }).eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  if (!isSignedIn) return null;

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Notifications"
        >
          <Icon icon={IconBell} size={20} />
          {(unreadCount > 0 || requests.length > 0) && (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "notifications" | "requests")}>
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {canManage && <TabsTrigger value="requests">Requests {requests.length > 0 && `(${requests.length})`}</TabsTrigger>}
          </TabsList>
          <TabsContent value="notifications" className="flex max-h-80 flex-col gap-1 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={`/issues/${n.issueId}`}
                  onClick={() => markRead(n.id)}
                  className={`flex flex-col gap-0.5 rounded-lg px-2 py-2 text-sm hover:bg-accent ${!n.readAt ? "bg-accent/50" : ""}`}
                >
                  <span className="text-foreground">
                    Someone {NOTIFICATION_LABEL[n.type] ?? "updated"} <strong>{n.issueTitle}</strong>
                  </span>
                </Link>
              ))
            )}
          </TabsContent>
          {canManage && (
            <TabsContent value="requests" className="flex max-h-80 flex-col gap-1 overflow-y-auto p-2">
              {requests.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No pending requests.</p>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm">
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate font-medium text-foreground">{r.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {r.kind === "private_access" ? "wants access to" : "wants to join the team on"} {r.issueTitle}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => (r.kind === "private_access" ? approvePrivateAccess(r.id) : approveActionTeam(r.id))}
                    >
                      Approve
                    </Button>
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
