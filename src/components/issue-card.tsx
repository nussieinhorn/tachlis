import Link from "next/link";
import { IconMapPin, IconUsers } from "@tabler/icons-react";

import type { Issue } from "@/lib/mock-data";
import { getCategory } from "@/lib/mock-data";
import { SPLASH_TONE_CLASSES } from "@/lib/splash-tone";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Icon } from "@/components/ui/icon";

export function IssueCard({ issue }: { issue: Issue }) {
  const category = getCategory(issue.categorySlug);

  return (
    <Link
      href={`/issues/${issue.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div
        className={`flex h-28 items-center justify-center ${SPLASH_TONE_CLASSES[issue.splashTone]}`}
      >
        <Icon icon={category.icon} size={36} className="text-white/90" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="gap-1">
            <Icon icon={category.icon} size={14} />
            {category.label}
          </Badge>
          <StatusBadge status={issue.status} />
        </div>

        <h3 className="font-heading font-semibold text-foreground group-hover:text-primary">
          {issue.title}
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">{issue.description}</p>

        <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon icon={IconUsers} size={16} />
            {issue.supporterCount} supporters
          </span>
          <span className="flex items-center gap-1">
            <Icon icon={IconMapPin} size={16} />
            {issue.location}
          </span>
        </div>
      </div>
    </Link>
  );
}
