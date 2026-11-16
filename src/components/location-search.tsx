"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconLoader2, IconMapPin } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { abbreviateLocation } from "@/lib/format";

export type NominatimResult = {
  place_id: number;
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

export function shortLabel(r: NominatimResult): string {
  const a = r.address;
  const city = a?.city ?? a?.town ?? a?.village ?? a?.hamlet ?? a?.municipality;
  if (city && a?.state) return abbreviateLocation(`${city}, ${a.state}`) ?? `${city}, ${a.state}`;
  return r.display_name.split(",").slice(0, 2).join(",").trim();
}

// Free, keyless geocoding via OpenStreetMap's Nominatim — city/town granularity only, short "City, ST" results.
export function LocationSearch({
  value,
  onChange,
  onSelect,
  placeholder = "Search city, state...",
  large = false,
  trailing,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Fires only when a suggestion is picked (not on every keystroke). */
  onSelect?: (value: string) => void;
  placeholder?: string;
  large?: boolean;
  /** Optional control shown inside the right end of the field. */
  trailing?: ReactNode;
}) {
  const [query, setQuery] = useState(value);

  // Lets a parent fill the field itself (e.g. from the browser's current location).
  useEffect(() => {
    setQuery(value);
  }, [value]);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&featureType=city&limit=5&q=${encodeURIComponent(query)}`,
        );
        if (!res.ok) return;
        const data: NominatimResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const showDropdown = open && (loading || results.length > 0);

  return (
    <div className="relative">
      <Icon
        icon={IconMapPin}
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ${large ? "left-4 text-foreground" : "left-3"}`}
      />
      <Input
        className={large ? `h-14 border-2 border-foreground bg-background pl-12 text-lg font-semibold placeholder:font-medium focus-visible:border-primary focus-visible:ring-primary/30 ${trailing ? "pr-36" : ""}` : "pl-9"}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {trailing && <div className="absolute top-1/2 right-2 -translate-y-1/2">{trailing}</div>}
      {showDropdown && (
        <ul className="absolute top-full left-0 z-50 mt-1 min-h-11 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          {loading ? (
            <li className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
              <Icon icon={IconLoader2} size={14} className="animate-spin" />
              Searching...
            </li>
          ) : (
            results.map((r) => (
              <li key={r.place_id}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const short = shortLabel(r);
                    setQuery(short);
                    onChange(short);
                    onSelect?.(short);
                    setOpen(false);
                  }}
                >
                  {shortLabel(r)}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
