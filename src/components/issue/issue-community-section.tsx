"use client";

import Link from "next/link";
import { IconLock, IconUsersGroup } from "@tabler/icons-react";

import type { Community } from "@/lib/communities-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function IssueCommunitySection({ community }: { community: Community }) {
  const { isAdmin } = useAdminMode();
  const isPrivate = community.privacy === "private";

  if (isPrivate && !isAdmin) return null;

  return (
    <section className="flex flex-col gap-3 border-t border-border pt-6">
      <h2 className="font-heading text-lg font-semibold text-foreground">Community</h2>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Icon icon={IconUsersGroup} size={18} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              {isPrivate && <Icon icon={IconLock} size={14} className="text-muted-foreground" />}
              {community.name}
            </span>
            <span className="line-clamp-1 text-sm text-muted-foreground">{community.description}</span>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/communities/${community.id}`}>View community</Link>
        </Button>
      </div>
    </section>
  );
}
