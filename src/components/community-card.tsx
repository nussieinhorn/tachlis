"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconUsersGroup,
  IconMapPin,
  IconUsers,
  IconClipboardList,
  IconDots,
  IconPencil,
  IconTrash,
  IconLock,
} from "@tabler/icons-react";

import { COMMUNITY_TONE_CLASSES, type Community } from "@/lib/communities-data";
import { pluralize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CommunityCard({
  community,
  issueCount,
  canEdit,
}: {
  community: Community;
  issueCount: number;
  canEdit: boolean;
}) {
  const [deleted, setDeleted] = useState(false);
  const router = useRouter();

  async function deleteCommunity() {
    const supabase = createClient();
    const { error } = await supabase.from("communities").delete().eq("id", community.id);
    if (!error) {
      setDeleted(true);
      router.refresh();
    }
  }

  if (deleted) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        <span>&quot;{community.name}&quot; was deleted.</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      {canEdit && (
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Community options"
              >
                <Icon icon={IconDots} size={16} />
              </button>
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
              <ConfirmDialog
                title="Delete this community?"
                description={`"${community.name}" will be permanently deleted. This can't be undone.`}
                onConfirm={deleteCommunity}
                trigger={
                  <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                    <Icon icon={IconTrash} size={16} />
                    Delete
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <Link href={`/communities/${community.displayCode}`} className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-full text-white ${COMMUNITY_TONE_CLASSES[community.tone]}`}
          >
            <Icon icon={IconUsersGroup} size={20} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="flex items-center gap-1.5 truncate font-heading font-semibold text-foreground">
              {community.privacy === "private" && (
                <Icon icon={IconLock} size={14} className="shrink-0 text-muted-foreground" />
              )}
              {community.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon icon={IconMapPin} size={12} />
              {community.location}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{community.privacy === "private" ? "Private" : "Public"}</Badge>
        </div>

        <div className="mt-auto flex items-center gap-4 pt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon icon={IconUsers} size={16} />
            {community.memberCount} {pluralize(community.memberCount, "member")}
          </span>
          <span className="flex items-center gap-1">
            <Icon icon={IconClipboardList} size={16} />
            {issueCount} {pluralize(issueCount, "issue")}
          </span>
        </div>
      </Link>
    </div>
  );
}
