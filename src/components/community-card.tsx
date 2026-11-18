"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconMapPin,
  IconUsers,
  IconClipboardList,
  IconDots,
  IconPencil,
  IconTrash,
  IconLock,
} from "@tabler/icons-react";

import type { Community } from "@/lib/communities-data";
import { CommunityAvatar } from "@/components/community-avatar";
import { pluralize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCanDelete } from "@/lib/use-permissions";
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
  const canDelete = useCanDelete(community.ownerId);

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
    <div className="group relative flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <CommunityAvatar tone={community.tone} name={community.name} />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* The name link stretches over the whole card, so the entire card is clickable. */}
          <Link
            href={`/communities/${community.displayCode}`}
            className="type-subsection line-clamp-2 transition-colors duration-150 after:absolute after:inset-0 after:rounded-2xl group-hover:text-primary"
          >
            {community.privacy === "private" && (
              <Icon icon={IconLock} size={14} className="mr-1.5 mb-0.5 inline-block text-muted-foreground" />
            )}
            {community.name}
          </Link>
          {community.location && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Icon icon={IconMapPin} size={14} className="shrink-0" />
              <span className="truncate">{community.location}</span>
            </span>
          )}
        </div>

        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative z-10 -mt-1 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Community options"
              >
                <Icon icon={IconDots} size={18} />
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
              {canDelete && (
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
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {community.privacy === "private" && (
        <div>
          <Badge variant="outline">Private</Badge>
        </div>
      )}

      <div className="mt-auto flex items-center gap-5 border-t border-border pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Icon icon={IconUsers} size={16} />
          {community.memberCount} {pluralize(community.memberCount, "member")}
        </span>
        <span className="flex items-center gap-1.5">
          <Icon icon={IconClipboardList} size={16} />
          {issueCount} {pluralize(issueCount, "issue")}
        </span>
      </div>
    </div>
  );
}
