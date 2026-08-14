import Link from "next/link";
import { IconChevronRight, IconLock, IconUsersGroup } from "@tabler/icons-react";

import { COMMUNITY_TONE_CLASSES, type Community } from "@/lib/communities-data";
import { pluralize } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export function MyCommunityRow({ community, issueCount }: { community: Community; issueCount: number }) {
  return (
    <Link
      href={`/communities/${community.id}`}
      className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 hover:bg-accent"
    >
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-full text-white ${COMMUNITY_TONE_CLASSES[community.tone]}`}
      >
        <Icon icon={IconUsersGroup} size={22} />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <span className="flex items-center gap-1.5 truncate font-heading text-lg font-semibold text-foreground">
          {community.privacy === "private" && <Icon icon={IconLock} size={16} className="shrink-0" />}
          {community.name}
        </span>
        <span className="text-sm text-muted-foreground">
          {issueCount} {pluralize(issueCount, "issue")}
        </span>
      </div>
      <Icon icon={IconChevronRight} size={18} className="shrink-0 text-muted-foreground" />
    </Link>
  );
}
