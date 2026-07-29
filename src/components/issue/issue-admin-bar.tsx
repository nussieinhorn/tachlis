"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconDots, IconEye, IconEyeOff, IconPencil, IconTrash } from "@tabler/icons-react";

import type { Issue } from "@/lib/mock-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function IssueAdminBar({ issue }: { issue: Issue }) {
  const { isAdmin } = useAdminMode();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col gap-2">
      {hidden && (
        <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          This issue is hidden from the public feed (admin preview only).
        </div>
      )}
      <div className="flex items-center gap-2 self-end">
        <CreateIssueDialog
          editIssue={issue}
          trigger={
            <Button variant="outline" size="sm">
              <Icon icon={IconPencil} size={14} />
              Edit
            </Button>
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Issue options">
              <Icon icon={IconDots} size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setHidden((h) => !h)}>
              <Icon icon={hidden ? IconEye : IconEyeOff} size={16} />
              {hidden ? "Unhide" : "Hide"}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => router.push("/")}>
              <Icon icon={IconTrash} size={16} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
