"use client";

import { useMemo, useState } from "react";
import { IconChevronDown, IconMapPin, IconArrowsSort } from "@tabler/icons-react";

import type { Issue } from "@/lib/mock-data";
import { CATEGORIES, LOCATIONS, type Location } from "@/lib/mock-data";
import { IssueCard } from "@/components/issue-card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 5;

type SortOption = "trending" | "recent" | "alphabetical";

const SORT_LABELS: Record<SortOption, string> = {
  trending: "Trending",
  recent: "Recent",
  alphabetical: "Alphabetical",
};

function sortIssues(issues: Issue[], sort: SortOption): Issue[] {
  if (sort === "alphabetical") {
    return [...issues].sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === "trending") {
    return [...issues].sort((a, b) => b.supporterCount - a.supporterCount);
  }
  return issues;
}

export function IssueBrowser({ issues }: { issues: Issue[] }) {
  const [location, setLocation] = useState<Location>("Worldwide");
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("trending");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function toggleCategory(slug: string) {
    setCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
    setVisibleCount(PAGE_SIZE);
  }

  function selectLocation(loc: Location) {
    setLocation(loc);
    setVisibleCount(PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    const matches = issues.filter((issue) => {
      const matchesLocation = location === "Worldwide" || issue.locationArea === location;
      const matchesCategory =
        categorySlugs.length === 0 || categorySlugs.includes(issue.categorySlug);
      return matchesLocation && matchesCategory;
    });
    return sortIssues(matches, sort);
  }, [issues, location, categorySlugs, sort]);

  const visible = filtered.slice(0, visibleCount);
  const categoryLabel =
    categorySlugs.length === 0 ? "All" : `${categorySlugs.length} selected`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Icon icon={IconMapPin} size={16} />
                Location: {location}
                <Icon icon={IconChevronDown} size={16} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {LOCATIONS.map((loc) => (
                <DropdownMenuItem key={loc} onClick={() => selectLocation(loc)}>
                  {loc}
                  {loc === location && <span className="ml-auto text-xs text-muted-foreground">Selected</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Category: {categoryLabel}
                <Icon icon={IconChevronDown} size={16} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {CATEGORIES.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.slug}
                  checked={categorySlugs.includes(category.slug)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => toggleCategory(category.slug)}
                >
                  {category.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Icon icon={IconArrowsSort} size={16} />
              Sort: {SORT_LABELS[sort]}
              <Icon icon={IconChevronDown} size={16} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
              <DropdownMenuItem key={option} onClick={() => setSort(option)}>
                {SORT_LABELS[option]}
                {option === sort && <span className="ml-auto text-xs text-muted-foreground">Selected</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No issues match these filters yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visible.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <Button
              variant="outline"
              className="mx-auto w-fit"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}
