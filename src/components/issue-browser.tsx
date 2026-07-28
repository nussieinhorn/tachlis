"use client";

import { useMemo, useState } from "react";
import { IconChevronDown, IconMapPin } from "@tabler/icons-react";

import type { Issue } from "@/lib/mock-data";
import { CATEGORIES, LOCATIONS, type Location } from "@/lib/mock-data";
import { IssueCard } from "@/components/issue-card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function IssueBrowser({ issues }: { issues: Issue[] }) {
  const [location, setLocation] = useState<Location>("Worldwide");
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);

  function toggleCategory(slug: string) {
    setCategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const filtered = useMemo(() => {
    return issues.filter((issue) => {
      const matchesLocation = location === "Worldwide" || issue.locationArea === location;
      const matchesCategory =
        categorySlugs.length === 0 || categorySlugs.includes(issue.categorySlug);
      return matchesLocation && matchesCategory;
    });
  }, [issues, location, categorySlugs]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Quick Filters</h2>

        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Icon icon={IconMapPin} size={16} />
                {location}
                <Icon icon={IconChevronDown} size={16} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {LOCATIONS.map((loc) => (
                <DropdownMenuItem key={loc} onClick={() => setLocation(loc)}>
                  {loc}
                  {loc === location && <span className="ml-auto text-xs text-muted-foreground">Selected</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border" />

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const active = categorySlugs.includes(category.slug);
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => toggleCategory(category.slug)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    active && "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                  )}
                >
                  <Icon icon={category.icon} size={14} />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No issues match these filters yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
