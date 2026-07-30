"use client";

import { useRouter } from "next/navigation";
import { IconDots, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";

import type { Community } from "@/lib/communities-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CommunityAdminBar({ community }: { community: Community }) {
  const { isAdmin } = useAdminMode();
  const router = useRouter();

  if (!isAdmin) return null;

  return (
    <div className="flex items-center gap-2">
      <CreateIssueDialog
        lockedCommunityId={community.id}
        trigger={
          <Button size="sm">
            <Icon icon={IconPlus} size={16} />
            Create Issue
          </Button>
        }
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Community options">
            <Icon icon={IconDots} size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <CreateCommunityDialog
            editCommunity={community}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Icon icon={IconPencil} size={16} />
                Edit
              </DropdownMenuItem>
            }
          />
          <DropdownMenuItem variant="destructive" onClick={() => router.push("/communities")}>
            <Icon icon={IconTrash} size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
