import Link from "next/link";
import { IconCalendar, IconUsers, IconMapPin, IconArrowRight } from "@tabler/icons-react";

import type { Issue } from "@/lib/mock-data";
import { getCategory } from "@/lib/mock-data";
import { pluralize } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";

export function MyIssueRow({ issue }: { issue: Issue }) {
  const category = getCategory(issue.categorySlug);

  return (
    <div className="group flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 hover:bg-accent">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm font-medium text-foreground">{issue.title}</span>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon icon={category.icon} size={12} />
            {category.label}
          </span>
          <span className="flex items-center gap-1">
            <Icon icon={IconCalendar} size={12} />
            {issue.createdAt}
          </span>
          <span className="flex items-center gap-1">
            <Icon icon={IconUsers} size={12} />
            {issue.supporterCount} {pluralize(issue.supporterCount, "supporter")}
          </span>
          {issue.location && (
            <span className="flex items-center gap-1">
              <Icon icon={IconMapPin} size={12} />
              {issue.location}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={issue.status} />
        <Link
          href={`/issues/${issue.displayCode}`}
          className="flex items-center gap-1 text-sm font-medium text-primary md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          View/Edit
          <Icon icon={IconArrowRight} size={14} />
        </Link>
      </div>
    </div>
  );
}
