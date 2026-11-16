"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconCurrentLocation, IconLoader2, IconMapPin, IconX } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { abbreviateLocation } from "@/lib/format";
import { cn } from "@/lib/utils";

export type NominatimResult = {
  place_id: number;
  lat?: string;
  lon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    state?: string;
  };
  display_name: string;
};

/** "Lakewood Township" -> "Lakewood", so labels match how people type places. */
function plainCity(city: string): string {
  return city.replace(/\s+(township|twp\.?|city|town|borough|village)$/i, "").trim() || city;
}

export function shortLabel(r: NominatimResult): string {
  const a = r.address;
  const city = a?.city ?? a?.town ?? a?.village ?? a?.hamlet ?? a?.municipality;
  if (city && a?.state) {
    const label = `${plainCity(city)}, ${a.state}`;
    return abbreviateLocation(label) ?? label;
  }
  return r.display_name.split(",").slice(0, 2).join(",").trim();
}

// Free, keyless geocoding via OpenStreetMap's Nominatim — city/town granularity only, short "City, ST" results.
export type ResolvedPlace = { label: string; lat: number; lon: number };

export function LocationSearch({
  value,
  onChange,
  onSelect,
  onResolve,
  status,
  onClear,
  onUseCurrent,
  locating = false,
  placeholder = "Search city, state...",
  large = false,
  trailing,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Fires only when a suggestion is picked (not on every keystroke). */
  onSelect?: (value: string) => void;
  /** Fires with the real place (label + coordinates) when one is picked, and with null as soon as the text is edited. */
  onResolve?: (place: ResolvedPlace | null) => void;
  /** Shows a small line under the field: a verified tick, or a nudge to pick from the list. */
  status?: "verified" | "unverified";
  /** Shows a clear (x) button while the field has text. */
  onClear?: () => void;
  /** Adds a "Use my current location" row to the suggestions. */
  onUseCurrent?: () => void;
  locating?: boolean;
  placeholder?: string;
  large?: boolean;
  /** Optional control shown inside the right end of the field. */
  trailing?: ReactNode;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickedRef = useRef<string | null>(null);

  // Lets a parent fill the field itself (e.g. from the browser's current location).
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    if (query.trim().length < 3 || query === pickedRef.current) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&featureType=city&limit=5&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setActive(data.length > 0 ? 0 : -1);
      } catch {
        /* aborted or offline */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const showCurrentRow = Boolean(onUseCurrent) && query.trim().length < 3;
  const showDropdown = open && (loading || results.length > 0 || showCurrentRow);

  function pick(r: NominatimResult) {
    const short = shortLabel(r);
    pickedRef.current = short;
    setQuery(short);
    onChange(short);
    onSelect?.(short);
    if (onResolve && r.lat && r.lon) onResolve({ label: short, lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
    setOpen(false);
    inputRef.current?.blur();
  }

  function clear() {
    pickedRef.current = null;
    setQuery("");
    setResults([]);
    onChange("");
    onResolve?.(null);
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <div>
    <div className="relative">
      <Icon
        icon={IconMapPin}
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          large ? "left-4 text-foreground" : "left-3",
        )}
      />
      <Input
        ref={inputRef}
        className={cn(
          large
            ? "h-14 rounded-2xl border-2 border-foreground bg-background pl-12 text-lg font-semibold shadow-md placeholder:font-medium focus-visible:border-primary focus-visible:ring-primary/30"
            : "pl-9",
          trailing && "pr-36",
          onClear && query && !trailing && "pr-10",
        )}
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        onChange={(e) => {
          pickedRef.current = null;
          setQuery(e.target.value);
          onChange(e.target.value);
          onResolve?.(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && results.length > 0) {
            e.preventDefault();
            setActive((i) => (i + 1) % results.length);
          } else if (e.key === "ArrowUp" && results.length > 0) {
            e.preventDefault();
            setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
          } else if (e.key === "Enter" && open && results[active]) {
            e.preventDefault();
            pick(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      <div className={cn("absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1")}>
        {onClear && query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear location"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon icon={IconX} size={16} />
          </button>
        )}
        {trailing}
      </div>

      {showDropdown && (
        <ul className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-xl">
          {showCurrentRow && (
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  onUseCurrent?.();
                }}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  {locating ? (
                    <Icon icon={IconLoader2} size={16} className="animate-spin" />
                  ) : (
                    <Icon icon={IconCurrentLocation} size={16} />
                  )}
                </span>
                Use my current location
              </button>
            </li>
          )}
          {loading && !showCurrentRow ? (
            <li className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
              <Icon icon={IconLoader2} size={14} className="animate-spin" />
              Searching...
            </li>
          ) : (
            results.map((r, i) => (
              <li key={r.place_id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    i === active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                  )}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(r);
                  }}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon icon={IconMapPin} size={16} />
                  </span>
                  <span className="font-medium">{shortLabel(r)}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {r.display_name.split(",").slice(-2).join(",").trim()}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
      {status && query.trim() && (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1.5 text-xs font-medium",
            status === "verified" ? "text-status-resolved" : "text-muted-foreground",
          )}
        >
          {status === "verified" ? "✓ Verified location" : "Pick a place from the list so we can find it on the map."}
        </p>
      )}
    </div>
  );
}
