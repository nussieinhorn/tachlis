"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconShare, IconCrown, IconCheck, IconX, IconChevronDown, IconMailForward, IconBan } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SharePanel } from "@/components/issue/share-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ResourceType = "issue" | "community";
type Role = "viewer" | "editor";

type Person = { userId: string; name: string; email: string };
type RequestRow = { id: string; userId: string; name: string; email: string; message: string | null; status: string };
type InviteRow = { id: string; email: string; role: Role; token: string };

const TABLES: Record<ResourceType, { editors: "issue_editors" | "community_editors"; requests: "private_access_requests" | "community_access_requests"; fk: "issue_id" | "community_id" }> = {
  issue: { editors: "issue_editors", requests: "private_access_requests", fk: "issue_id" },
  community: { editors: "community_editors", requests: "community_access_requests", fk: "community_id" },
};

async function sendInviteEmail(payload: {
  type: "invite" | "access_approved" | "access_requested";
  to: string;
  data: { resourceTitle?: string; resourceType?: ResourceType; role?: Role; link: string; requesterName?: string };
}) {
  const supabase = createClient();
  try {
    await supabase.functions.invoke("send-transactional-email", { body: payload });
  } catch {
    // Non-fatal — the DB write already succeeded, email delivery is best-effort.
  }
}

export function ShareAccessPanel({
  resourceType,
  resourceId,
  resourceTitle,
  isPrivate,
  canEdit,
  ownerName,
  triggerClassName,
}: {
  resourceType: ResourceType;
  resourceId: string;
  resourceTitle: string;
  isPrivate: boolean;
  canEdit: boolean;
  ownerName?: string;
  triggerClassName?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"pending" | "active" | "revoked">("pending");
  const [editors, setEditors] = useState<Person[]>([]);
  const [approvedViewers, setApprovedViewers] = useState<RequestRow[]>([]);
  const [pending, setPending] = useState<RequestRow[]>([]);
  const [revoked, setRevoked] = useState<RequestRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("viewer");
  const [roleChoice, setRoleChoice] = useState<Record<string, Role>>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const table = TABLES[resourceType];
  const label = resourceType === "issue" ? "issue" : "community";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://tachlis.org";

  async function load() {
    const supabase = createClient();
    const editorTable = table.editors;
    const requestTable = table.requests;
    const fk = table.fk;

    const [editorsRes, requestsRes, invitesRes] = await Promise.all([
      supabase
        .from(editorTable)
        .select(`user_id, member:profiles!${editorTable}_user_id_fkey(name, email)`)
        .eq(fk as never, resourceId),
      supabase
        .from(requestTable)
        .select(`id, status, message, user_id, requester:profiles!${requestTable}_user_id_fkey(name, email)`)
        .eq(fk as never, resourceId),
      supabase
        .from("pending_invites")
        .select("id, email, role, token")
        .eq("resource_type", resourceType)
        .eq("resource_id", resourceId)
        .eq("status", "pending"),
    ]);

    setEditors(
      (editorsRes.data ?? []).map((r) => {
        const member = r.member as unknown as { name: string; email: string } | null;
        return { userId: r.user_id, name: member?.name ?? "", email: member?.email ?? "" };
      }),
    );

    const requests = (requestsRes.data ?? []).map((r) => {
      const requester = r.requester as unknown as { name: string; email: string } | null;
      return { id: r.id, userId: r.user_id, name: requester?.name ?? "", email: requester?.email ?? "", message: r.message, status: r.status };
    });
    setApprovedViewers(requests.filter((r) => r.status === "approved"));
    setPending(requests.filter((r) => r.status === "pending"));
    setRevoked(requests.filter((r) => r.status === "rejected" || r.status === "revoked"));
    setInvites((invitesRes.data ?? []).map((i) => ({ id: i.id, email: i.email, role: i.role as Role, token: i.token })));
  }

  useEffect(() => {
    if (open && isPrivate && canEdit) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const roleFor = (id: string) => roleChoice[id] ?? "viewer";

  async function approveRequest(request: RequestRow) {
    const supabase = createClient();
    const role = roleFor(request.id);
    await supabase.from(table.requests).update({ status: "approved" }).eq("id", request.id);
    if (role === "editor") {
      await supabase.from(table.editors).insert({ [table.fk]: resourceId, user_id: request.userId } as never);
    }
    if (request.email) {
      sendInviteEmail({
        type: "access_approved",
        to: request.email,
        data: { resourceTitle, resourceType, link: `${origin}/${resourceType === "community" ? "communities" : "issues"}` },
      });
    }
    await load();
    router.refresh();
  }

  async function reject(requestId: string) {
    const supabase = createClient();
    await supabase.from(table.requests).update({ status: "rejected" }).eq("id", requestId);
    await load();
    router.refresh();
  }

  async function revokeViewer(requestId: string) {
    const supabase = createClient();
    await supabase.from(table.requests).update({ status: "revoked" }).eq("id", requestId);
    await load();
    router.refresh();
  }

  async function revokeEditor(userId: string) {
    const supabase = createClient();
    await supabase.from(table.editors).delete().eq(table.fk as never, resourceId).eq("user_id", userId);
    await load();
    router.refresh();
  }

  async function revokeInvite(inviteId: string) {
    const supabase = createClient();
    await supabase.from("pending_invites").update({ status: "revoked" }).eq("id", inviteId);
    await load();
  }

  async function sendInvites() {
    setError(null);
    const emails = Array.from(
      new Set(
        inviteEmails
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean),
      ),
    );
    if (emails.length === 0) return;
    const invalid = emails.filter((e) => !isValidEmail(e));
    if (invalid.length > 0) {
      setError(`Not a valid email: ${invalid.join(", ")}`);
      return;
    }
    if (!user) return;
    setSending(true);
    const supabase = createClient();
    for (const email of emails) {
      const { data, error: insertError } = await supabase
        .from("pending_invites")
        .insert({ email, resource_type: resourceType, resource_id: resourceId, role: inviteRole, invited_by: user.id })
        .select("token")
        .single();
      if (insertError || !data) continue;
      await sendInviteEmail({
        type: "invite",
        to: email,
        data: { resourceTitle, resourceType, role: inviteRole, link: `${origin}/invite/accept?token=${data.token}` },
      });
    }
    setSending(false);
    setInviteEmails("");
    await load();
  }

  if (!isPrivate) {
    return (
      <>
        <Button type="button" variant="outline" className={cn("w-full", triggerClassName)} onClick={() => setOpen(true)}>
          <Icon icon={IconShare} size={16} />
          Share
        </Button>
        <SharePanel open={open} onOpenChange={setOpen} title={`Share this ${label}`} />
      </>
    );
  }

  if (!canEdit) return null;

  const pendingCount = pending.length + invites.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>
        <Button type="button" variant="outline" className={cn("w-full", triggerClassName)}>
          <Icon icon={IconShare} size={16} />
          Share
          {pendingCount > 0 && ` · ${pendingCount} pending`}
        </Button>
      </span>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Who has access</DialogTitle>
          <DialogDescription>
            Private {label} — only {ownerName ?? "the owner"} and invited people can see this.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Invite by email</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="one@email.com, two@email.com"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 items-center gap-1 rounded-md border border-input px-3 text-sm font-medium capitalize text-foreground hover:bg-accent"
                  >
                    {inviteRole}
                    <Icon icon={IconChevronDown} size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setInviteRole("viewer")}>Viewer</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setInviteRole("editor")}>Editor</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button type="button" size="sm" onClick={sendInvites} disabled={sending || !inviteEmails.trim()}>
                <Icon icon={IconMailForward} size={14} />
                {sending ? "Sending..." : "Invite"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Separate multiple emails with commas. They&apos;ll get access as soon as they accept.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "pending" | "active" | "revoked")} className="flex-1 overflow-hidden">
          <TabsList className="w-full">
            <TabsTrigger value="pending">Pending {pendingCount > 0 && `(${pendingCount})`}</TabsTrigger>
            <TabsTrigger value="active">Active ({1 + editors.length + approvedViewers.length})</TabsTrigger>
            <TabsTrigger value="revoked">Revoked {revoked.length > 0 && `(${revoked.length})`}</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="flex flex-col gap-4 overflow-y-auto">
            {invites.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Invites sent</p>
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {invites.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium text-foreground">{inv.email}</span>
                        <span className="text-xs text-muted-foreground capitalize">{inv.role} · awaiting acceptance</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => revokeInvite(inv.id)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Revoke invite"
                      >
                        <Icon icon={IconBan} size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pending.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Access requests</p>
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                  {pending.map((r) => (
                    <li key={r.id} className="flex flex-col gap-2 px-3 py-2">
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium text-foreground">{r.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{r.email}</span>
                        {r.message && <span className="mt-0.5 text-xs text-foreground/80">&quot;{r.message}&quot;</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium capitalize text-foreground hover:bg-accent"
                            >
                              {roleFor(r.id)}
                              <Icon icon={IconChevronDown} size={12} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setRoleChoice((prev) => ({ ...prev, [r.id]: "viewer" }))}>
                              Viewer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRoleChoice((prev) => ({ ...prev, [r.id]: "editor" }))}>
                              Editor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                          type="button"
                          onClick={() => approveRequest(r)}
                          aria-label="Approve"
                          className="flex size-7 items-center justify-center rounded-md border border-status-resolved/25 bg-status-resolved/12 text-status-resolved hover:bg-status-resolved/20"
                        >
                          <Icon icon={IconCheck} size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => reject(r.id)}
                          aria-label="Reject"
                          className="flex size-7 items-center justify-center rounded-md border border-destructive/25 bg-destructive/12 text-destructive hover:bg-destructive/20"
                        >
                          <Icon icon={IconX} size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {invites.length === 0 && pending.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">Nothing pending.</p>
            )}
          </TabsContent>

          <TabsContent value="active" className="overflow-y-auto">
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              <li className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Icon icon={IconCrown} size={14} className="text-muted-foreground" />
                  <span className="truncate text-sm font-medium text-foreground">{ownerName ?? "Owner"}</span>
                </div>
                <span className="text-xs text-muted-foreground">Owner</span>
              </li>
              {editors.map((e) => (
                <li key={e.userId} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-foreground">{e.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{e.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Editor</span>
                    <Button size="sm" variant="ghost" onClick={() => revokeEditor(e.userId)}>
                      Revoke
                    </Button>
                  </div>
                </li>
              ))}
              {approvedViewers.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-foreground">{v.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{v.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Viewer</span>
                    <Button size="sm" variant="ghost" onClick={() => revokeViewer(v.id)}>
                      Revoke
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="revoked" className="overflow-y-auto">
            {revoked.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No revoked or rejected requests.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border rounded-lg border border-border opacity-70">
                {revoked.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-foreground">{r.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{r.email}</span>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
