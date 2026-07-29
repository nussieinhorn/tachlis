"use client";

import { useState } from "react";

import { ISSUE_STATUSES, StatusBadge, type IssueStatus } from "@/components/ui/status-badge";
import { useAdminMode } from "@/lib/admin-mode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function IssueAdminStatus({ initialStatus }: { initialStatus: IssueStatus }) {
  const { isAdmin } = useAdminMode();
  const [status, setStatus] = useState(initialStatus);

  if (!isAdmin) return <StatusBadge status={status} size="lg" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="cursor-pointer">
          <StatusBadge status={status} size="lg" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ISSUE_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => {
              // TODO(supabase): onUpdateIssueStatus({ issueId, status: s })
              setStatus(s);
            }}
          >
            <StatusBadge status={s} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
