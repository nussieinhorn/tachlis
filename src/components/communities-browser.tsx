"use client";

import { useEffect, useMemo, useState } from "react";
import { IconCurrentLocation, IconLoader2, IconPlus, IconX } from "@tabler/icons-react";

import type { Community } from "@/lib/communities-data";
import { abbreviateLocation } from "@/lib/format";
import { CommunityCard } from "@/components/community-card";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { GlobalSearch } from "@/components/global-search";
import { shortLabel, type NominatimResult } from "@/components/location-search";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

const PAGE_SIZE = 9;
/** How far from the chosen place a community can be and still count as "near". */
const NEARBY_KM = 40;

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// "Lakewood Township, NJ" should match "Lakewood, NJ".
const norm = (v: string) =>
  (abbreviateLocation(v) ?? v)
    .toLowerCase()
    .replace(/\b(township|twp\.?|city|town|borough|village)\b/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();

export function CommunitiesBrowser({
  communities,
  issueCounts,
  editableIds,
}: {
  communities: Community[];
  issueCounts: Record<string, number>;
  editableIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState("");
  const [placeCoords, setPlaceCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const editableIdSet = useMemo(() => new Set(editableIds), [editableIds]);

  function selectPlace(next: string, coords?: { lat: number; lon: number }) {
    setPlace(next);
    setPlaceCoords(next ? (coords ?? null) : null);
    setVisibleCount(PAGE_SIZE);
  }

  // Start from where the visitor is. If they decline or it fails, the list just stays unfiltered.
  function useMyLocation() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=10&lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          if (res.ok) {
            selectPlace(shortLabel((await res.json()) as NominatimResult), { lat: coords.latitude, lon: coords.longitude });
          }
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
    const q = query.trim().toLowerCase();
    const wanted = place ? norm(place) : "";
    const matches = communities.filter((c) => {
      const matchesText =
        q.length < 2 ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q);
      const matchesPlace =
        !wanted ||
        (placeCoords && c.latitude != null && c.longitude != null
          ? distanceKm(placeCoords, { lat: c.latitude, lon: c.longitude }) <= NEARBY_KM
          : norm(c.location).split(",")[0] === wanted.split(",")[0]);
      return matchesText && matchesPlace;
    });
    if (placeCoords) {
      const d = (c: Community) =>
        c.latitude != null && c.longitude != null
          ? distanceKm(placeCoords, { lat: c.latitude, lon: c.longitude })
          : Number.MAX_SAFE_INTEGER;
      return [...matches].sort((a, b) => d(a) - d(b));
    }
    return matches;
  }, [query, place, placeCoords, communities]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-5">
      <div className="mx-auto w-full max-w-2xl">
        <GlobalSearch
          issues={[]}
          categories={[]}
          communities={communities}
          placeholder="Search communities or places"
          query={query}
          onQuery={(q) => {
            setQuery(q);
            setVisibleCount(PAGE_SIZE);
          }}
          onPickPlace={selectPlace}
          onPickTopic={() => {}}
          onUseCurrent={useMyLocation}
          locating={locating}
          trailing={
            <Button
              type="button"
              size="sm"
              aria-label="Near me"
              onClick={useMyLocation}
              disabled={locating}
              className="h-10 px-3 max-sm:size-10 max-sm:px-0"
            >
              <Icon icon={locating ? IconLoader2 : IconCurrentLocation} size={16} className={locating ? "animate-spin" : ""} />
              <span className="hidden sm:inline">{locating ? "Finding you" : "Near me"}</span>
            </Button>
          }
        />
      </div>

      {place && (
        <div className="animate-tick mx-auto flex w-full max-w-2xl items-center justify-between gap-3 rounded-xl bg-accent px-4 py-2.5 text-sm text-accent-foreground">
          <span>
            Showing <strong className="font-extrabold">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "community" : "communities"} near <strong className="font-extrabold">{place}</strong>
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

      <div className="flex justify-center">
        <CreateCommunityDialog
          trigger={
            <Button size="sm">
              <Icon icon={IconPlus} size={16} />
              New community
            </Button>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
          <p className="font-heading text-lg font-extrabold">No communities here yet{place ? ` near ${place}` : ""}.</p>
          <p className="max-w-sm text-sm text-muted-foreground">Try a nearby city, or start the first one yourself.</p>
          {place && (
            <Button variant="outline" size="sm" onClick={() => selectPlace("")}>
              Show everywhere
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                issueCount={issueCounts[community.id] ?? 0}
                canEdit={editableIdSet.has(community.id)}
              />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <Button variant="outline" className="mx-auto w-fit" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}
