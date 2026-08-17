"use client";

import { useRouter } from "next/navigation";
import { IconCopy, IconDots, IconPencil, IconTrash } from "@tabler/icons-react";

import type { Issue } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function IssueAdminBar({ issue, canEdit }: { issue: Issue; canEdit: boolean }) {
  const router = useRouter();

  if (!canEdit) return null;

  async function deleteIssue() {
    const supabase = createClient();
    const { error } = await supabase.from("issues").delete().eq("id", issue.id);
    if (!error) router.push("/");
  }

  return (
    <div className="flex flex-col gap-2">
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
            <CreateIssueDialog
              duplicateFrom={issue}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Icon icon={IconCopy} size={16} />
                  Duplicate
                </DropdownMenuItem>
              }
            />
            <ConfirmDialog
              title="Delete this issue?"
              description={`"${issue.title}" and everything on it — solutions, comments, updates — will be permanently deleted. This can't be undone.`}
              onConfirm={deleteIssue}
              trigger={
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Icon icon={IconTrash} size={16} />
                  Delete
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
