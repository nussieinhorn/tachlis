import Link from "next/link";
import { IconArrowRight, IconLock, IconMapPin, IconUsers } from "@tabler/icons-react";

import type { Community } from "@/lib/communities-data";
import { pluralize } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/** The community this issue belongs to: a clickable card with its logo, what it is and how big it is. */
export function IssueCommunitySection({ community }: { community: Community }) {
  const isPrivate = community.privacy === "private";

  return (
    <section className="flex flex-col gap-3">
      <h2 className="type-panel">Part of a community</h2>
      <Link
        href={`/communities/${community.displayCode}`}
        className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-lg sm:flex-row sm:items-center sm:gap-5 sm:p-6"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="type-subsection flex items-center gap-1.5 transition-colors duration-150 group-hover:text-primary">
            {isPrivate && <Icon icon={IconLock} size={16} className="text-muted-foreground" />}
            {community.name}
          </span>
          {community.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{community.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-muted-foreground">
            {community.location && (
              <span className="flex items-center gap-1">
                <Icon icon={IconMapPin} size={14} />
                {community.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Icon icon={IconUsers} size={14} />
              {community.memberCount} {pluralize(community.memberCount, "member")}
            </span>
          </div>
        </div>

        <span className="flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background shadow-sm transition-transform duration-200 group-hover:translate-x-0.5 sm:self-center">
          View
          <Icon icon={IconArrowRight} size={16} />
        </span>
      </Link>
    </section>
  );
}
