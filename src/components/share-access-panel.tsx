"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconShare, IconCrown, IconPencil, IconEye } from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SharePanel } from "@/components/issue/share-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ResourceType = "issue" | "community";

type Person = { userId: string; name: string; email: string };
type RequestRow = { id: string; userId: string; name: string; email: string; message: string | null; status: string };

const TABLES: Record<ResourceType, { editors: "issue_editors" | "community_editors"; requests: "private_access_requests" | "community_access_requests"; fk: "issue_id" | "community_id" }> = {
  issue: { editors: "issue_editors", requests: "private_access_requests", fk: "issue_id" },
  community: { editors: "community_editors", requests: "community_access_requests", fk: "community_id" },
};

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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editors, setEditors] = useState<Person[]>([]);
  const [approvedViewers, setApprovedViewers] = useState<RequestRow[]>([]);
  const [pending, setPending] = useState<RequestRow[]>([]);
  const [revoked, setRevoked] = useState<RequestRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showRevoked, setShowRevoked] = useState(false);

  const table = TABLES[resourceType];
  const label = resourceType === "issue" ? "issue" : "community";

  async function load() {
    const supabase = createClient();
    const editorTable = table.editors === "issue_editors" ? "issue_editors" : "community_editors";
    const requestTable = table.requests === "private_access_requests" ? "private_access_requests" : "community_access_requests";
    const editorFk = table.fk;

    const [editorsRes, requestsRes] = await Promise.all([
      supabase
        .from(editorTable)
        .select(`user_id, member:profiles!${editorTable}_user_id_fkey(name, email)`)
        .eq(editorFk as never, resourceId),
      supabase
        .from(requestTable)
        .select(`id, status, message, user_id, requester:profiles!${requestTable}_user_id_fkey(name, email)`)
        .eq(editorFk as never, resourceId),
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
  }

  useEffect(() => {
    if (open && isPrivate && canEdit) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function approveAsViewer(requestId: string) {
    const supabase = createClient();
    await supabase.from(table.requests).update({ status: "approved" }).eq("id", requestId);
    await load();
    router.refresh();
  }

  async function approveAsEditor(requestId: string, userId: string) {
    const supabase = createClient();
    await supabase.from(table.requests).update({ status: "approved" }).eq("id", requestId);
    await supabase.from(table.editors).insert({ [table.fk]: resourceId, user_id: userId } as never);
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

  async function grantAccess(role: "edit" | "view") {
    setError(null);
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!profile) {
      setError("No Tachlis account found for that email.");
      return;
    }
    if (role === "edit") {
      await supabase.from(table.editors).insert({ [table.fk]: resourceId, user_id: profile.id } as never);
    } else {
      await supabase.from(table.requests).upsert(
        { [table.fk]: resourceId, user_id: profile.id, status: "approved" } as never,
        { onConflict: `${table.fk},user_id` },
      );
    }
    setInviteEmail("");
    await load();
    router.refresh();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>
        <Button type="button" variant="outline" className={cn("w-full", triggerClassName)}>
          <Icon icon={IconShare} size={16} />
          Share
          {pending.length > 0 && ` · ${pending.length} pending`}
        </Button>
      </span>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Who has access</DialogTitle>
          <DialogDescription>
            Private {label} — only {ownerName ?? "the owner"} and invited people can see this.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Grant access</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="button" size="sm" variant="outline" onClick={() => grantAccess("view")}>
                <Icon icon={IconEye} size={14} />
                Viewer
              </Button>
              <Button type="button" size="sm" onClick={() => grantAccess("edit")}>
                <Icon icon={IconPencil} size={14} />
                Editor
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {pending.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pending ({pending.length})
              </p>
              <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {pending.map((r) => (
                  <li key={r.id} className="flex flex-col gap-2 px-3 py-2">
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-foreground">{r.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{r.email}</span>
                      {r.message && <span className="mt-0.5 text-xs text-foreground/80">&quot;{r.message}&quot;</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => approveAsViewer(r.id)}>
                        Approve as Viewer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => approveAsEditor(r.id, r.userId)}>
                        Approve as Editor
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => reject(r.id)}>
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active</p>
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
              {editors.length === 0 && approvedViewers.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">No one else has access yet.</li>
              )}
            </ul>
          </div>

          {revoked.length > 0 && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowRevoked((s) => !s)}
                className="w-fit text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                {showRevoked ? "Hide" : "Show"} revoked ({revoked.length})
              </button>
              {showRevoked && (
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
