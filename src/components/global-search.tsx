"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { IconCurrentLocation, IconFileText, IconLoader2, IconMapPin, IconSearch, IconUsersGroup, IconX } from "@tabler/icons-react";

import type { Category, Issue } from "@/lib/mock-data";
import type { Community } from "@/lib/communities-data";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { searchPlaces, shortLabel, type NominatimResult } from "@/components/location-search";
import { cn } from "@/lib/utils";

type Item =
  | { kind: "issue"; key: string; title: string; sub: string; code: string }
  | { kind: "community"; key: string; title: string; sub: string; code: string }
  | { kind: "topic"; key: string; title: string; sub: string; slug: string; icon: Category["icon"] }
  | { kind: "place"; key: string; title: string; sub: string; lat?: number; lon?: number };

const GROUP_TITLES: Record<Item["kind"], string> = { issue: "Issues", community: "Communities", topic: "Topics", place: "Places" };

/** One search box for everything: issue titles, topics (categories) and places. Typing also live-filters the feed. */
export function GlobalSearch({
  issues,
  categories,
  communities = [],
  placeholder = "Search issues, places, ZIP codes or topics",
  query,
  onQuery,
  onPickPlace,
  onPickTopic,
  onUseCurrent,
  locating,
  trailing,
}: {
  issues: Issue[];
  categories: Category[];
  /** When given, communities are suggested too (use with empty issues/categories on the Communities page). */
  communities?: Community[];
  placeholder?: string;
  query: string;
  onQuery: (q: string) => void;
  onPickPlace: (place: string, coords?: { lat: number; lon: number }) => void;
  onPickTopic: (slug: string) => void;
  onUseCurrent: () => void;
  locating: boolean;
  trailing?: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [places, setPlaces] = useState<NominatimResult[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();

  // Places come from OpenStreetMap's free geocoder; issues and topics are matched instantly in the browser.
  useEffect(() => {
    setPlaces([]);
    if (q.length < 3) {
      setLoadingPlaces(false);
      return;
    }
    setLoadingPlaces(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setPlaces(await searchPlaces(query, controller.signal, 4));
      } catch {
        /* aborted or offline */
      } finally {
        if (!controller.signal.aborted) setLoadingPlaces(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, q.length]);

  const items: Item[] = useMemo(() => {
    if (q.length < 2) return [];
    const issueMatches: Item[] = issues
      .filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
      .slice(0, 4)
      .map((i) => ({ kind: "issue", key: `i-${i.id}`, title: i.title, sub: i.location || "", code: i.displayCode }));
    const communityMatches: Item[] = communities
      .filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.location.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({ kind: "community", key: `c-${c.id}`, title: c.name, sub: c.location, code: c.displayCode }));
    const topicMatches: Item[] = categories
      .filter((c) => c.label.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => {
        const n = issues.filter((i) => i.categorySlug === c.slug).length;
        return { kind: "topic", key: `t-${c.slug}`, title: c.label, sub: `${n} ${n === 1 ? "issue" : "issues"}`, slug: c.slug, icon: c.icon };
      });
    const placeMatches: Item[] = places.map((p) => ({
      kind: "place",
      key: `p-${p.place_id}`,
      title: shortLabel(p),
      sub: p.display_name.split(",").slice(-2).join(",").trim(),
      lat: p.lat ? parseFloat(p.lat) : undefined,
      lon: p.lon ? parseFloat(p.lon) : undefined,
    }));
    return [...issueMatches, ...communityMatches, ...topicMatches, ...placeMatches];
  }, [q, issues, categories, communities, places]);

  useEffect(() => setActive(0), [items.length]);

  function choose(item: Item) {
    setOpen(false);
    if (item.kind === "issue") {
      router.push(`/issues/${item.code}`);
    } else if (item.kind === "community") {
      router.push(`/communities/${item.code}`);
    } else if (item.kind === "topic") {
      onQuery("");
      onPickTopic(item.slug);
    } else {
      onQuery("");
      onPickPlace(item.title, item.lat != null && item.lon != null ? { lat: item.lat, lon: item.lon } : undefined);
    }
    inputRef.current?.blur();
  }

  const showEmptyHelp = open && q.length < 2;
  const showDropdown = open && (q.length >= 2 ? items.length > 0 || loadingPlaces : true);

  let lastKind: Item["kind"] | null = null;

  return (
    <div className="relative">
      <Icon icon={IconSearch} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-foreground" />
      <Input
        ref={inputRef}
        value={query}
        autoComplete="off"
        placeholder={placeholder}
        className="h-13 rounded-2xl border-2 border-foreground bg-background pr-14 pl-11 text-base font-semibold shadow-md sm:h-14 sm:pr-36 sm:pl-12 sm:text-lg placeholder:font-medium focus-visible:border-primary focus-visible:ring-primary/30"
        onChange={(e) => {
          onQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && items.length > 0) {
            e.preventDefault();
            setActive((i) => (i + 1) % items.length);
          } else if (e.key === "ArrowUp" && items.length > 0) {
            e.preventDefault();
            setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
          } else if (e.key === "Enter" && open && items[active]) {
            e.preventDefault();
            choose(items[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onQuery("");
              inputRef.current?.focus();
            }}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon icon={IconX} size={16} />
          </button>
        )}
        {trailing}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-xl">
          {showEmptyHelp && (
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-accent"
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                onUseCurrent();
              }}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon icon={locating ? IconLoader2 : IconCurrentLocation} size={16} className={locating ? "animate-spin" : ""} />
              </span>
              Use my current location
              <span className="ml-auto text-xs font-normal text-muted-foreground">or type to search</span>
            </button>
          )}

          {items.map((item, i) => {
            const header = item.kind !== lastKind;
            lastKind = item.kind;
            return (
              <div key={item.key}>
                {header && (
                  <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    {GROUP_TITLES[item.kind]}
                  </p>
                )}
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(item);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    i === active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon
                      icon={item.kind === "issue" ? IconFileText : item.kind === "community" ? IconUsersGroup : item.kind === "place" ? IconMapPin : item.icon}
                      size={16}
                    />
                  </span>
                  <span className="line-clamp-1 font-semibold">{item.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{item.sub}</span>
                </button>
              </div>
            );
          })}

          {loadingPlaces && (
            <p className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
              <Icon icon={IconLoader2} size={14} className="animate-spin" />
              Looking up places...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
