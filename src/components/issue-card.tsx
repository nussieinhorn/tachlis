import Link from "next/link";
import { IconMapPin, IconUsers } from "@tabler/icons-react";

import type { Issue } from "@/lib/mock-data";
import { getCategory } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Icon } from "@/components/ui/icon";

export function IssueCard({ issue }: { issue: Issue }) {
  const category = getCategory(issue.categorySlug);

  return (
    <Link
      href={`/issues/${issue.displayCode}`}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={issue.status} />
        <Badge variant="outline" className="gap-1">
          <Icon icon={category.icon} size={14} />
          {category.label}
        </Badge>
      </div>

      <h3 className="font-heading text-2xl leading-snug font-bold text-foreground group-hover:text-primary sm:text-3xl">
        {issue.title}
      </h3>

      <div className="mt-auto flex items-center gap-4 pt-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Icon icon={IconUsers} size={16} />
          {issue.supporterCount} supporters
        </span>
        <span className="flex items-center gap-1">
          <Icon icon={IconMapPin} size={16} />
          {issue.location}
        </span>
      </div>
    </Link>
  );
}
