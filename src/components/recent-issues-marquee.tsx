import type { Issue, Category, CategoryOption } from "@/lib/mock-data";
import { getCategoryIcon } from "@/lib/category-icons";
import { IssueCard } from "@/components/issue-card";

/** Big issue cards drifting slowly across the screen. Pauses on hover; the list is repeated once for a seamless loop. */
export function RecentIssuesMarquee({ issues, categories }: { issues: Issue[]; categories: CategoryOption[] }) {
  const categoryList: Category[] = categories.map((c) => ({
    slug: c.slug,
    label: c.label,
    icon: getCategoryIcon(c.iconSlug),
  }));

  const group = (hidden: boolean) => (
    <div className="flex gap-5 pr-5" aria-hidden={hidden || undefined}>
      {issues.map((issue) => (
        <div key={issue.id} className="flex w-[18.5rem] shrink-0 flex-col sm:w-[26rem] [&>a]:h-full" tabIndex={hidden ? -1 : undefined}>
          <IssueCard issue={issue} categories={categoryList} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="group relative -mx-4 overflow-hidden sm:-mx-6 py-3 motion-reduce:overflow-x-auto">
      <div className="roll-left flex w-max group-hover:[animation-play-state:paused]">
        {group(false)}
        {group(true)}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
