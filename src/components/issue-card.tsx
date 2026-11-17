import Link from "next/link";
import { pluralize } from "@/lib/utils";
import { IconMapPin, IconUsers } from "@tabler/icons-react";

import type { Category, Issue } from "@/lib/mock-data";
import { getCategory } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Icon } from "@/components/ui/icon";

export function IssueCard({ issue, categories }: { issue: Issue; categories?: Category[] }) {
  const category = categories?.find((c) => c.slug === issue.categorySlug) ?? getCategory(issue.categorySlug);

  return (
    <Link
      href={`/issues/${issue.displayCode}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-lg sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={issue.status} />
        <Badge variant="outline" className="gap-1">
          <Icon icon={category.icon} size={14} />
          {category.label}
        </Badge>
      </div>

      <h3 className="type-card-title transition-colors duration-150 group-hover:text-primary">
        {issue.title}
      </h3>

      <div className="mt-auto flex items-center gap-4 pt-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Icon icon={IconUsers} size={16} />
          {issue.supporterCount} {pluralize(issue.supporterCount, "supporter")}
        </span>
        <span className="flex items-center gap-1">
          <Icon icon={IconMapPin} size={16} />
          {issue.location}
        </span>
      </div>
    </Link>
  );
}
