"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconUsersGroup,
  IconMapPin,
  IconUsers,
  IconClipboardList,
  IconDots,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import { COMMUNITY_TONE_CLASSES, getCommunityIssueCount, type Community } from "@/lib/communities-data";
import { useAdminMode } from "@/lib/admin-mode";
import { useCommunityMembership } from "@/lib/community-membership";
import { pluralize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CommunityCard({ community }: { community: Community }) {
  const { isAdmin } = useAdminMode();
  const { isJoined } = useCommunityMembership();
  const [deleted, setDeleted] = useState(false);
  const issueCount = getCommunityIssueCount(community.id);
  const joined = isJoined(community.id);

  if (deleted) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        <span>&quot;{community.name}&quot; was deleted.</span>
        <button type="button" className="font-medium text-primary hover:underline" onClick={() => setDeleted(false)}>
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      {isAdmin && (
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
              <DropdownMenuItem variant="destructive" onClick={() => setDeleted(true)}>
                <Icon icon={IconTrash} size={16} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <Link href={`/communities/${community.id}`} className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-full text-white ${COMMUNITY_TONE_CLASSES[community.tone]}`}
          >
            <Icon icon={IconUsersGroup} size={20} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-heading font-semibold text-foreground">{community.name}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon icon={IconMapPin} size={12} />
              {community.location}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{community.privacy === "private" ? "Private" : "Public"}</Badge>
          {joined && <Badge variant="status-resolved">Joined</Badge>}
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
