"use client";

import { IconUserPlus } from "@tabler/icons-react";

import { usePrivateAccess } from "@/lib/private-access";
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

export function AccessRequestsWidget({ issueId }: { issueId: string }) {
  const { pendingByIssue, approve, approveAll } = usePrivateAccess();
  const pending = pendingByIssue[issueId] ?? [];

  return (
    <Dialog>
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
                <li key={request.email} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-foreground">{request.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{request.email}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => approve(issueId, request.email)}>
                    Approve
                  </Button>
                </li>
              ))}
            </ul>
            <Button type="button" size="sm" onClick={() => approveAll(issueId)} className="w-fit">
              Approve all
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
