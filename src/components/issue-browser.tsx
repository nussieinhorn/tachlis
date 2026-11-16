"use client";

import { useEffect, useMemo, useState } from "react";
import { IconChevronDown, IconCurrentLocation, IconFlame, IconLoader2, IconX } from "@tabler/icons-react";

import type { Issue, Category, CategoryOption } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/mock-data";
import { abbreviateLocation } from "@/lib/format";
import { shortLabel, type NominatimResult } from "@/components/location-search";
import { GlobalSearch } from "@/components/global-search";
import { getCategoryIcon } from "@/lib/category-icons";
import { IssueCard } from "@/components/issue-card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 5;

type SortOption = "trending" | "recent" | "alphabetical";

/** Same city, and the same state when the issue's location names one ("Lakewood Township, Ocean County" has none). */
function sameLocation(issueLoc: string, wanted: string): boolean {
  const [city, state] = issueLoc.split(",").map((p) => p.trim());
  const [wantedCity, wantedState] = wanted.split(",").map((p) => p.trim());
  if (city !== wantedCity) return false;
  if (!state || state.length !== 2 || !wantedState) return true;
  return state === wantedState;
}

function sortIssues(issues: Issue[], sort: SortOption): Issue[] {
  if (sort === "alphabetical") {
    return [...issues].sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sort === "trending") {
    return [...issues].sort((a, b) => b.supporterCount - a.supporterCount);
  }
  return issues;
}

export function IssueBrowser({ issues, categories }: { issues: Issue[]; categories?: CategoryOption[] }) {
  const categoryList: Category[] = useMemo(
    () =>
      categories
        ? categories.map((c) => ({ slug: c.slug, label: c.label, icon: getCategoryIcon(c.iconSlug) }))
        : CATEGORIES,
    [categories],
  );
  const [place, setPlace] = useState("");
  const [textQuery, setTextQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("recent");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // One category at a time; picking the active one again clears it.
  function toggleCategory(slug: string) {
    setCategorySlugs((prev) => (prev[0] === slug ? [] : [slug]));
    setVisibleCount(PAGE_SIZE);
  }

  function showTrending() {
    setCategorySlugs([]);
    setSort("trending");
    setVisibleCount(PAGE_SIZE);
  }

  function selectPlace(next: string) {
    setPlace(next);
    setVisibleCount(PAGE_SIZE);
  }

  // Start from where the visitor is. If they decline or it fails, the feed just stays unfiltered.
  function useMyLocation() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=10&lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          if (res.ok) selectPlace(shortLabel((await res.json()) as NominatimResult));
        } catch {
          /* leave unfiltered */
        }
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000, maximumAge: 600000 },
    );
  }

  useEffect(() => {
    if (!("permissions" in navigator)) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "granted") useMyLocation();
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    // "Lakewood Township, NJ" (from GPS) should match "Lakewood, NJ" (as people type it).
    const norm = (v: string) =>
      (abbreviateLocation(v) ?? v)
        .toLowerCase()
        .replace(/\b(township|twp\.?|city|town|borough|village)\b/g, "")
        .replace(/\s+/g, " ")
        .replace(/\s+,/g, ",")
        .trim();
    const wanted = place ? norm(place) : "";
    const matches = issues.filter((issue) => {
      const matchesLocation = !wanted || sameLocation(norm(issue.location ?? ""), wanted);
      const matchesCategory =
        categorySlugs.length === 0 || categorySlugs.includes(issue.categorySlug);
      const text = textQuery.trim().toLowerCase();
      const matchesText =
        text.length < 2 ||
        issue.title.toLowerCase().includes(text) ||
        issue.description.toLowerCase().includes(text) ||
        (issue.location ?? "").toLowerCase().includes(text) ||
        (categoryList.find((c) => c.slug === issue.categorySlug)?.label ?? "").toLowerCase().includes(text);
      return matchesLocation && matchesCategory && matchesText;
    });
    return sortIssues(matches, sort);
  }, [issues, place, categorySlugs, sort, textQuery, categoryList]);

  const popularCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const issue of issues) counts.set(issue.categorySlug, (counts.get(issue.categorySlug) ?? 0) + 1);
    return categoryList
      .filter((c) => counts.has(c.slug))
      .sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0))
      .map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }));
  }, [issues, categoryList]);

  const moreActive = popularCategories.slice(5).find((c) => categorySlugs.includes(c.slug));
  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-5">
      <div className="mx-auto w-full max-w-2xl">
        <GlobalSearch
          issues={issues}
          categories={categoryList}
          query={textQuery}
          onQuery={(q) => {
            setTextQuery(q);
            setVisibleCount(PAGE_SIZE);
          }}
          onPickPlace={selectPlace}
          onPickTopic={(slug) => {
            setCategorySlugs([slug]);
            setVisibleCount(PAGE_SIZE);
          }}
          onUseCurrent={useMyLocation}
          locating={locating}
          trailing={
            <Button type="button" size="sm" onClick={useMyLocation} disabled={locating} className="h-10 px-3">
              <Icon icon={locating ? IconLoader2 : IconCurrentLocation} size={16} className={locating ? "animate-spin" : ""} />
              {locating ? "Finding you" : "Near me"}
            </Button>
          }
        />
      </div>

      {place && (
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 rounded-xl bg-accent px-4 py-2.5 text-sm text-accent-foreground animate-tick">
          <span>
            Showing <strong className="font-extrabold">{filtered.length}</strong> {filtered.length === 1 ? "issue" : "issues"} in{" "}
            <strong className="font-extrabold">{place}</strong>
          </span>
          <button
            type="button"
            onClick={() => selectPlace("")}
            className="flex items-center gap-1 font-bold underline underline-offset-4 hover:opacity-80"
          >
            <Icon icon={IconX} size={14} />
            Show everywhere
          </button>
        </div>
      )}

      {popularCategories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={showTrending}
            aria-pressed={sort === "trending" && categorySlugs.length === 0}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold shadow-sm transition-all ${
              sort === "trending" && categorySlugs.length === 0
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card hover:border-foreground"
            }`}
          >
            <Icon icon={IconFlame} size={15} />
            Trending
          </button>
          {popularCategories.slice(0, 5).map((c) => {
            const active = categorySlugs.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggleCategory(c.slug)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold shadow-sm transition-all ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground"
                }`}
              >
                <Icon icon={c.icon} size={15} />
                {c.label}
                <span className={`text-xs font-medium ${active ? "text-background/70" : "text-muted-foreground"}`}>
                  {c.count}
                </span>
              </button>
            );
          })}
          {popularCategories.length > 5 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold shadow-sm transition-all ${
                    moreActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {moreActive ? moreActive.label : "More"}
                  <Icon icon={IconChevronDown} size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 min-w-56 overflow-y-auto rounded-xl p-1.5">
                {popularCategories.slice(5).map((c) => (
                  <DropdownMenuItem
                    key={c.slug}
                    onClick={() => toggleCategory(c.slug)}
                    className="gap-2 rounded-lg py-2 font-medium"
                  >
                    <Icon icon={c.icon} size={16} />
                    {c.label}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {categorySlugs[0] === c.slug ? "Selected" : c.count}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
          <p className="font-heading text-lg font-extrabold">Nothing here yet{place ? ` for ${place}` : ""}.</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a nearby city, pick a different topic, or be the first to raise an issue here.
          </p>
          <div className="flex gap-2">
            {place && (
              <Button variant="outline" size="sm" onClick={() => selectPlace("")}>
                Show everywhere
              </Button>
            )}
            {categorySlugs.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setCategorySlugs([])}>
                Clear topic
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
