"use client";

import Link from "next/link";
import { IconUsersGroup, IconLock } from "@tabler/icons-react";

import type { Community } from "@/lib/communities-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Icon } from "@/components/ui/icon";

export function IssueCommunityLink({ community }: { community: Community }) {
  const { isAdmin } = useAdminMode();
  const isPrivate = community.privacy === "private";

  if (isPrivate && !isAdmin) return null;

  return (
    <Link
      href={`/communities/${community.id}`}
      className="ml-auto flex items-center gap-1 text-sm font-medium text-primary hover:underline"
    >
      {isPrivate && <Icon icon={IconLock} size={14} />}
      <Icon icon={IconUsersGroup} size={14} />
      {community.name}
    </Link>
  );
}
