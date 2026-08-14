"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconUserPlus } from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PendingRequest = { id: string; name: string; email: string };

export function AccessRequestsWidget({ issueId }: { issueId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("private_access_requests")
      .select("id, requester:profiles!private_access_requests_user_id_fkey(name, email)")
      .eq("issue_id", issueId)
      .eq("status", "pending")
      .then(({ data }) => {
        setPending(
          (data ?? []).map((r) => {
            const requester = r.requester as { name: string; email: string } | null;
            return { id: r.id, name: requester?.name ?? "", email: requester?.email ?? "" };
          }),
        );
      });
  }, [open, issueId]);

  async function approve(id: string) {
    const supabase = createClient();
    await supabase.from("private_access_requests").update({ status: "approved" }).eq("id", id);
    setPending((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  async function approveAll() {
    const supabase = createClient();
    await supabase
      .from("private_access_requests")
      .update({ status: "approved" })
      .in("id", pending.map((r) => r.id));
    setPending([]);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon={IconUserPlus} size={16} />
          {pending.length > 0 ? `${pending.length} request${pending.length === 1 ? "" : "s"}` : "Access requests"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Access requests</DialogTitle>
          <DialogDescription>Approve people who asked to view this private issue.</DialogDescription>
        </DialogHeader>

        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {pending.map((request) => (
                <li key={request.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-foreground">{request.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{request.email}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => approve(request.id)}>
                    Approve
                  </Button>
                </li>
              ))}
            </ul>
            <Button type="button" size="sm" onClick={approveAll} className="w-fit">
              Approve all
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
