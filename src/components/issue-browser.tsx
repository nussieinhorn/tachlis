"use client";

import { useMemo, useState } from "react";
import { IconChevronDown, IconMapPin, IconArrowsSort } from "@tabler/icons-react";

import type { Issue, Category, CategoryOption } from "@/lib/mock-data";
import { CATEGORIES, LOCATIONS, type Location } from "@/lib/mock-data";
import { getCategoryIcon } from "@/lib/category-icons";
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
type HeaderMode = "public" | "trending";

const SORT_LABELS: Record<SortOption, string> = {
  trending: "Trending",
  recent: "Recent",
  alphabetical: "Alphabetical",
};

const HEADER_LABELS: Record<HeaderMode, string> = {
  public: "Public issues",
  trending: "Trending issues",
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

const FILTER_PILL_CLASS =
  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground";

export function IssueBrowser({ issues, categories }: { issues: Issue[]; categories?: CategoryOption[] }) {
  const categoryList: Category[] = useMemo(
    () =>
      categories
        ? categories.map((c) => ({ slug: c.slug, label: c.label, icon: getCategoryIcon(c.iconSlug) }))
        : CATEGORIES,
    [categories],
  );
  const [headerMode, setHeaderMode] = useState<HeaderMode>("public");
  const [location, setLocation] = useState<Location>("Worldwide");
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("recent");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function selectHeaderMode(mode: HeaderMode) {
    setHeaderMode(mode);
    setSort(mode === "trending" ? "trending" : "recent");
  }

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
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex w-fit items-center gap-1.5 hover:opacity-80">
            <h2 className="font-heading text-xl font-bold text-foreground">{HEADER_LABELS[headerMode]}</h2>
            <Icon icon={IconChevronDown} size={18} className="text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(Object.keys(HEADER_LABELS) as HeaderMode[]).map((mode) => (
            <DropdownMenuItem key={mode} onClick={() => selectHeaderMode(mode)}>
              {HEADER_LABELS[mode]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={FILTER_PILL_CLASS}>
                <Icon icon={IconMapPin} size={14} />
                {location}
                <Icon icon={IconChevronDown} size={14} className="text-muted-foreground" />
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
              <button type="button" className={FILTER_PILL_CLASS}>
                Category: {categoryLabel}
                <Icon icon={IconChevronDown} size={14} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {categoryList.map((category) => (
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
            <button type="button" className={FILTER_PILL_CLASS}>
              <Icon icon={IconArrowsSort} size={14} />
              Sort: {SORT_LABELS[sort]}
              <Icon icon={IconChevronDown} size={14} className="text-muted-foreground" />
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
              <IssueCard key={issue.id} issue={issue} categories={categoryList} />
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
