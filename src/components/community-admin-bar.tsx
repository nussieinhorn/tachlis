"use client";

import { useRouter } from "next/navigation";
import { IconDots, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";

import type { Community } from "@/lib/communities-data";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CommunityAdminBar({ community, canEdit }: { community: Community; canEdit: boolean }) {
  const router = useRouter();

  if (!canEdit) return null;

  async function deleteCommunity() {
    const supabase = createClient();
    const { error } = await supabase.from("communities").delete().eq("id", community.id);
    if (!error) router.push("/communities");
  }

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
          <DropdownMenuItem variant="destructive" onClick={deleteCommunity}>
            <Icon icon={IconTrash} size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
