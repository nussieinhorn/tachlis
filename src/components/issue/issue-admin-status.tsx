"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ISSUE_STATUSES, StatusBadge, type IssueStatus } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function IssueAdminStatus({
  issueId,
  initialStatus,
  canEdit,
}: {
  issueId: string;
  initialStatus: IssueStatus;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  if (!canEdit) return <StatusBadge status={status} size="lg" />;

  async function updateStatus(next: IssueStatus) {
    const supabase = createClient();
    const { error } = await supabase.from("issues").update({ status: next }).eq("id", issueId);
    if (!error) {
      setStatus(next);
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="cursor-pointer">
          <StatusBadge status={status} size="lg" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ISSUE_STATUSES.map((s) => (
          <DropdownMenuItem key={s} onClick={() => updateStatus(s)}>
            <StatusBadge status={s} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
