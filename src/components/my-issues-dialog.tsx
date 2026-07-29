"use client";

import Link from "next/link";
import { IconPencil } from "@tabler/icons-react";

import { ISSUES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Demo-only: a few mock issues labeled as "yours" since nothing is actually
// owned/persisted yet in this prototype.
const MY_ISSUE_IDS = ["3654", "3659", "3667"];

export function MyIssuesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const myIssues = ISSUES.filter((i) => MY_ISSUE_IDS.includes(i.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My issues</DialogTitle>
        </DialogHeader>
        <ul className="flex flex-col gap-2">
          {myIssues.map((issue) => (
            <li
              key={issue.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              <Link href={`/issues/${issue.id}`} className="flex flex-1 flex-col gap-1 overflow-hidden">
                <span className="truncate text-sm font-medium text-foreground">{issue.title}</span>
                <StatusBadge status={issue.status} />
              </Link>
              <CreateIssueDialog
                editIssue={issue}
                trigger={
                  <Button variant="outline" size="sm">
                    <Icon icon={IconPencil} size={14} />
                    Edit
                  </Button>
                }
              />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
